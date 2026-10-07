import { Component, EventEmitter, Input, OnInit, Output, signal, WritableSignal } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { EdgeAppComponentsUpdateFailedError, EdgeAppInstanceNotFoundError, EdgeAppValidationAppsNotInstalledError, EdgeAppValidationCheckCardinalitySingleInCategoryError, GenericError, } from "src/app/shared/errors/errors";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { PromiseUtils } from "src/app/shared/utils/promise/promise.utils";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { InstallationService } from "../../installation.service";
import { AppCenterUtil } from "../../shared/appcenterutil";
import { OpenemsAppCategory } from "../../shared/enums";
import { IbnUtils } from "../../shared/ibn.utils";
import { ComponentConfigurator, ConfigurationObject, ConfigurationState, FunctionState, } from "./component-configurator";

/** Translated texts shown on the error card. */
interface ErrorTexts {
    headline: string;
    title: string | null;
    hint: string | null;
}

/** A single well-known, matchable Edge error and the guidance shown for it. */
interface KnownErrorSignature {
    /**
     * Structured Edge error code (see OpenemsError.java), checked first when present on the JSON-RPC error - stable and
     * version-independent, unlike the message text.
     */
    code: number | null;
    /**
     * Message-text match, used only for errors that have no {@link code} at all (e.g. transport-level timeout/
     * connection failures that never reach Edge's exception handling, so Edge cannot attach a structured code to
     * them).
     */
    pattern: RegExp | null;
    /** Whether {@link ConfigurationExecuteComponent.resolveCategoryConflictAndRetry} can fix this automatically. */
    isSelfSolvableConflict: boolean;
    getTexts: (translate: TranslateService) => ErrorTexts;
}

/**
 * Known backend errors, each translated into a bold headline (what to do next), a short sub-title (what kind of error
 * it is) and a hint (why it happened) - so the installer sees more than just a raw technical message.
 *
 * Edge exposes structured error codes (see OpenemsError.java) for the App-related cases below, matched via
 * {@link KnownErrorSignature.code}. Timeout/connection errors have no Edge-side code, since they are transport-level
 * failures (dropped websocket, JS timeout) that never reach Edge's exception handling - these are matched by
 * {@link KnownErrorSignature.pattern} instead.
 *
 * The category conflict entry additionally keeps a message-text {@link KnownErrorSignature.pattern} fallback: if the
 * request is relayed through a backend that does not yet know error code 2102, {@link JsonrpcResponseError#from} on
 * that older binary can't resolve the code and collapses the response to the generic code `1`. Remove this pattern
 * once every relevant backend is guaranteed to know code 2102.
 */
const KNOWN_ERROR_SIGNATURES: KnownErrorSignature[] = [
    {
        code: EdgeAppInstanceNotFoundError.id,
        pattern: null,
        isSelfSolvableConflict: true,
        getTexts: (translate) => ({
            headline: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_CATEGORY_CONFLICT"),
            title: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_TITLE_STALE_INSTANCE"),
            hint: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HINT_STALE_INSTANCE"),
        }),
    },
    {
        code: EdgeAppComponentsUpdateFailedError.id,
        pattern: null,
        isSelfSolvableConflict: true,
        getTexts: (translate) => ({
            headline: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_CATEGORY_CONFLICT"),
            title: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_TITLE_STALE_INSTANCE"),
            hint: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HINT_STALE_INSTANCE"),
        }),
    },
    {
        code: EdgeAppValidationAppsNotInstalledError.id,
        pattern: null,
        isSelfSolvableConflict: false,
        getTexts: (translate) => ({
            headline: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_INCOMPATIBLE_APP"),
            title: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_TITLE_INCOMPATIBLE_APP"),
            hint: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HINT_INCOMPATIBLE_APP"),
        }),
    },
    {
        code: EdgeAppValidationCheckCardinalitySingleInCategoryError.id,
        pattern: /bereits.*App.*derselben Kategorie.*Integrierte Systeme.*installiert|already.*app.*of the same category.*Integrated Systems.*installed/i,
        isSelfSolvableConflict: true,
        getTexts: (translate) => ({
            headline: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_CATEGORY_CONFLICT"),
            title: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_TITLE_CATEGORY_CONFLICT"),
            hint: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HINT_CATEGORY_CONFLICT"),
        }),
    },
    {
        code: null,
        pattern: /timeout|timed out/i,
        isSelfSolvableConflict: false,
        getTexts: (translate) => ({
            headline: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_TIMEOUT"),
            title: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_TITLE_TIMEOUT"),
            hint: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HINT_TIMEOUT"),
        }),
    },
    {
        code: null,
        pattern: /not connected|websocket|connection/i,
        isSelfSolvableConflict: false,
        getTexts: (translate) => ({
            headline: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_CONNECTION"),
            title: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_TITLE_CONNECTION"),
            hint: translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HINT_CONNECTION"),
        }),
    },
];

/** Grouped error display state - these fields always change together, so they are held as a single signal. */
interface ErrorState extends ErrorTexts {
    message: string;
    isSelfSolvableConflict: boolean;
}

@Component({
    selector: ConfigurationExecuteComponent.SELECTOR,
    templateUrl: "./configuration-execute.component.html",
    standalone: false,
})
export class ConfigurationExecuteComponent implements OnInit {
    private static readonly SELECTOR = "configuration-execute";

    @Input() public ibn!: AbstractIbn;
    @Input() public edge!: Edge;
    @Output() public previousViewEvent: EventEmitter<void> = new EventEmitter<void>();
    @Output() public nextViewEvent: EventEmitter<void> = new EventEmitter<void>();

    protected isWaiting: WritableSignal<boolean> = signal(false);
    protected configurationObjectsToBeConfigured: WritableSignal<ConfigurationObject[]> = signal([]);
    protected showConfigurationExecuteBatteryNote: boolean = false;
    protected goNextPage: boolean = true;
    protected isNextDisabled: WritableSignal<boolean> = signal(true);
    /** Set whenever the configuration or function test fails, so the installer can see and report the error. */
    protected errorState: WritableSignal<ErrorState | null> = signal(null);
    /** Set while automatically removing the conflicting app and retrying, shown instead of the resolve button. */
    protected conflictResolutionStatus: WritableSignal<string | null> = signal(null);
    /** Guards {@link resolveCategoryConflictAndRetry} against re-entrancy from a double click on its button. */
    protected isResolvingConflict: WritableSignal<boolean> = signal(false);
    /**
     * Set when the app installation itself failed, even though some/all components' individual configState already
     * turned "Configured" (they run in parallel) - used to prevent showing a misleading success checkmark.
     */
    protected appInstallFailed: WritableSignal<boolean> = signal(false);
    /**
     * A persistent (non-toast) description of what is currently happening, cleared once done/failed or an error is
     * shown.
     */
    protected currentStatusMessage: WritableSignal<string | null> = signal(null);
    private componentConfigurator: Promise<ComponentConfigurator> | null = null;
    private isAnyConfigurationObjectPreConfigured: boolean = false;

    constructor(
        private service: Service,
        private websocket: Websocket,
        private translate: TranslateService,
        private installationService: InstallationService,
    ) {}

    public async ngOnInit(): Promise<void> {
        this.showConfigurationExecuteBatteryNote = this.ibn?.showNote ?? false;
        this.goNextPage = !this.showConfigurationExecuteBatteryNote;
        const stopOnRequest: Subject<void> = new Subject<void>();
        this.isWaiting.set(true);

        this.edge
            .getConfig(this.websocket)
            .pipe(
                takeUntil(stopOnRequest),
                filter((config): config is NonNullable<typeof config> => config !== null),
            )
            .subscribe(async (config) => {
                stopOnRequest.next();
                stopOnRequest.complete();

                // Clear any stale error/status state from a previous run before (re-)evaluating the configuration.
                this.resetTransientState();

                // Fetch component configurator
                this.componentConfigurator = this.ibn.getComponentConfigurator(
                    this.edge,
                    config,
                    this.websocket,
                    this.service,
                    this.installationService,
                );

                const [reason, resolvedConfigurator] = await PromiseUtils.Functions.handle(this.componentConfigurator);
                if (reason) {
                    this.handleError(reason);
                    this.isWaiting.set(false);
                    return;
                }

                if (!resolvedConfigurator) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.UNDEFINED_COMPONENT_CONFIGURATOR"),
                        "danger",
                    );
                    this.isWaiting.set(false);
                    return;
                }

                // Add objects to component configurator
                this.configurationObjectsToBeConfigured.set(
                    resolvedConfigurator.getConfigurationObjectsToBeConfigured(),
                );
                this.isAnyConfigurationObjectPreConfigured = resolvedConfigurator.anyHasConfigurationState(
                    ConfigurationState.PreConfigured,
                );
                this.isWaiting.set(false);

                // To update scheduler.
                this.ibn.setRequiredControllers();
                IbnUtils.addIbnToSessionStorage(this.ibn);

                // Auto-start configuration when no components pre-configured
                if (this.isAnyConfigurationObjectPreConfigured) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.EXISTING_CONFIGURATION"),
                        "warning",
                        5000,
                    );
                } else {
                    this.startConfiguration();
                }
            });
    }

    public onPreviousClicked(): void {
        this.previousViewEvent.emit();
    }

    public onNextClicked(): void {
        if (!this.goNextPage) {
            this.goNextPage = true;
            return;
        }

        this.nextViewEvent.emit();
    }

    /** Starts the configuration based on the components selected. */
    public async startConfiguration(skipMetaAppUpdate: boolean = false): Promise<void> {
        this.isWaiting.set(true);
        this.resetTransientState();

        if (this.componentConfigurator === null) {
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.UNDEFINED_COMPONENT_CONFIGURATOR"),
                "danger",
            );
            this.isWaiting.set(false);
            return;
        }

        const [reason, resolvedConfigurator] = await PromiseUtils.Functions.handle(this.componentConfigurator);
        if (reason) {
            // The error card (set by handleError) already informs the installer - an additional toast would only
            // arrive with a confusing delay (queued behind the error card) and duplicate the same information.
            this.handleError(reason);
            this.isWaiting.set(false);
            return;
        }

        if (!resolvedConfigurator) {
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.UNDEFINED_COMPONENT_CONFIGURATOR"),
                "danger",
            );
            this.isWaiting.set(false);
            return;
        }

        this.currentStatusMessage.set(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.STATUS_CONFIGURING"));

        const [startError] = await PromiseUtils.Functions.handle(resolvedConfigurator.start({ skipMetaAppUpdate }));
        if (startError) {
            this.appInstallFailed.set(resolvedConfigurator.hasAppInstallFailed());
            // The error card (set by handleError) already informs the installer with a headline/title/hint and,
            // where applicable, a self-solve button - an extra toast would duplicate it and can visibly lag behind,
            // since it is queued after any still-active toast. Do not start the function test either, the
            // configuration itself already failed.
            this.handleError(startError);
            this.isWaiting.set(false);
            return;
        }

        this.service.toast(
            this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.SUCCESSFULLY_CONFIGURED"),
            "success",
        );

        this.currentStatusMessage.set(
            this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.STATUS_FUNCTION_TEST"),
        );
        const [functionTestError] = await PromiseUtils.Functions.handle(
            resolvedConfigurator.startFunctionTest(this.ibn, this.ibn.WAIT_FOR_BATTERY_SERIAL_NUMBERS),
        );
        if (functionTestError) {
            this.handleError(functionTestError);
        } else {
            this.currentStatusMessage.set(null);
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FINISH_FUNCTION_TEST"),
                "success",
            );
            this.isNextDisabled.set(false);
        }
        this.isWaiting.set(false);
    }

    /** Copies the currently displayed error to the clipboard, so it can be shared with support. */
    public async copyErrorToClipboard(): Promise<void> {
        const error = this.errorState();
        if (error === null) {
            return;
        }
        const clipboardLines = [
            error.message,
            // Ibn snapshot for reproduction, e.g. pasting into a Junit test reproducing the reported issue. Returning
            // undefined from the replacer omits the "translate" key entirely (TranslateService is not serializable).
            "Ibn: " + JSON.stringify(this.ibn, (key, value) => (key === "translate" ? undefined : value), 2),
        ];
        const [reason] = await PromiseUtils.Functions.handle(navigator.clipboard.writeText(clipboardLines.join("\n")));
        if (reason !== null) {
            this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR"), "danger");
            return;
        }
        this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_COPIED"), "success");
    }

    /**
     * Effective config state for display: if the app installation itself failed, a "configured" component can't truly
     * be considered successful (its creation depends on that same app), so it is shown as failed too.
     */
    protected displayConfigState(configurationObject: ConfigurationObject): ConfigurationState | null {
        if (this.appInstallFailed() && configurationObject.configState === ConfigurationState.Configured) {
            return ConfigurationState.Error;
        }
        return configurationObject.configState ?? null;
    }

    /**
     * Effective function state for display, see {@link displayConfigState}. Null until the function test has started
     * or while the component's State channel has no known value yet.
     */
    protected displayFunctionState(configurationObject: ConfigurationObject): FunctionState | null {
        if (this.appInstallFailed() && configurationObject.functionState === FunctionState.Ok) {
            return FunctionState.Fault;
        }
        return configurationObject.functionState ?? null;
    }

    /**
     * Removes conflicting/stale app instances on Edge - another app of the same category already installed, and/or a
     * leftover instance of the app being installed itself (e.g. from an earlier, partially failed attempt) - and
     * retries the configuration. Used from the error card when {@link ErrorState.isSelfSolvableConflict} is set.
     */
    protected async resolveCategoryConflictAndRetry(): Promise<void> {
        if (this.isResolvingConflict()) {
            // Ignore re-entrant calls, e.g. from a double click on the resolve button.
            return;
        }
        this.isResolvingConflict.set(true);
        this.conflictResolutionStatus.set(
            this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.RESOLVE_CATEGORY_CONFLICT_REMOVING"),
        );

        const [reason] = await PromiseUtils.Functions.handle(this.collectAndRemoveConflictingInstances());
        this.isResolvingConflict.set(false);
        this.conflictResolutionStatus.set(null);

        if (reason) {
            this.handleError(reason);
            return;
        }

        await this.startConfiguration(true);
    }

    /** Resets all transient error/status state before (re-)evaluating or (re-)starting the configuration. */
    private resetTransientState(): void {
        this.errorState.set(null);
        this.conflictResolutionStatus.set(null);
        this.isResolvingConflict.set(false);
        this.appInstallFailed.set(false);
        this.currentStatusMessage.set(null);
    }

    /**
     * Collects and removes all app instances that could be blocking the current installation: other apps of the same
     * category, and any leftover instance of the app being installed itself.
     */
    private async collectAndRemoveConflictingInstances(): Promise<void> {
        const categoryResponse = await AppCenterUtil.getAppInstancesByCategory(
            this.edge,
            this.websocket,
            OpenemsAppCategory.INTEGRATED_SYSTEM,
        );
        const instanceIds = new Set(categoryResponse.result.apps.map((app) => app.instanceId));

        // Also collect a leftover instance of the app being installed itself. Since this app is itself in the same
        // category, it may already be part of instanceIds above - collected into a Set to avoid trying to delete
        // the same instance twice.
        if (this.ibn.systemAppId != null) {
            const ownInstances = await AppCenterUtil.getAppInstances(this.edge, this.websocket, this.ibn.systemAppId);
            ownInstances.result.instances.forEach((instance) => instanceIds.add(instance.instanceId));
        }

        if (instanceIds.size === 0) {
            throw new Error(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.RESOLVE_CATEGORY_CONFLICT_NOT_FOUND"),
            );
        }

        await AppCenterUtil.removeInstances(this.edge, this.websocket, Array.from(instanceIds));
    }

    /**
     * Records an error so it stays visible to the installer: the raw message, the components that did not reach a
     * successful state (if any are already known) and, where possible, a headline/title/hint guiding the next step.
     */
    private handleError(reason: unknown): void {
        // An error takes precedence: any "still in progress" message would now be stale/contradictory.
        this.currentStatusMessage.set(null);

        const message = this.extractErrorMessage(reason);
        const code = this.extractErrorCode(reason);
        const signature = this.findKnownErrorSignature(code, message);
        if (signature === null) {
            this.errorState.set({
                message,
                headline: this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.ERROR_HEADLINE_GENERIC"),
                title: null,
                hint: null,
                isSelfSolvableConflict: false,
            });
            return;
        }
        this.errorState.set({
            message,
            ...signature.getTexts(this.translate),
            isSelfSolvableConflict: signature.isSelfSolvableConflict,
        });
    }

    /**
     * Looks up the first entry in {@link KNOWN_ERROR_SIGNATURES} matching the structured Edge error {@link code} (when
     * present and not the generic fallback code `1`), otherwise the first entry whose message pattern matches.
     *
     * @returns The matching signature, or null if the error is unknown
     */
    private findKnownErrorSignature(code: number | null, errorMessage: string): KnownErrorSignature | null {
        if (code !== null && code !== GenericError.id) {
            const signatureByCode = KNOWN_ERROR_SIGNATURES.find((signature) => signature.code === code);
            if (signatureByCode !== undefined) {
                return signatureByCode;
            }
        }
        const signatureByPattern = KNOWN_ERROR_SIGNATURES.find(
            (signature) => signature.pattern !== null && signature.pattern.test(errorMessage),
        );
        return signatureByPattern ?? null;
    }

    /** Extracts a readable message from a thrown JSON-RPC error, {@link Error} or plain value. */
    private extractErrorMessage(reason: unknown): string {
        if (reason && typeof reason === "object" && "error" in reason) {
            const jsonrpcError = (reason as { error?: { message?: string } }).error;
            if (jsonrpcError?.message) {
                return jsonrpcError.message;
            }
        }
        if (reason instanceof Error) {
            return reason.message;
        }
        if (typeof reason === "string") {
            return reason;
        }
        return JSON.stringify(reason);
    }

    /**
     * Extracts the structured Edge error code (see OpenemsError.java) from a thrown JSON-RPC error, if present - null
     * for older Edge versions, connection/timeout errors and any other non-JSON-RPC failure.
     */
    private extractErrorCode(reason: unknown): number | null {
        if (reason && typeof reason === "object" && "error" in reason) {
            const jsonrpcError = (reason as { error?: { code?: number } }).error;
            if (typeof jsonrpcError?.code === "number") {
                return jsonrpcError.code;
            }
        }
        return null;
    }
}
