import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { IbnUtils } from "../../shared/ibn.utils";
import { ComponentConfigurator, ConfigurationObject, ConfigurationState, FunctionState, } from "./component-configurator";

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

    protected isWaiting: boolean = false;
    protected configurationObjectsToBeConfigured: ConfigurationObject[] = [];
    protected showConfigurationExecuteBatteryNote: boolean = false;
    protected goNextPage: boolean = true;
    protected isNextDisabled: boolean = true;
    private componentConfigurator: Promise<ComponentConfigurator> | null = null;
    private isAnyConfigurationObjectPreConfigured: boolean = false;

    constructor(
        private service: Service,
        private websocket: Websocket,
        private translate: TranslateService,
        private cdr: ChangeDetectorRef,
    ) {}

    public async ngOnInit(): Promise<void> {
        this.showConfigurationExecuteBatteryNote = this.ibn?.showNote ?? false;
        this.goNextPage = !this.showConfigurationExecuteBatteryNote;
        const stopOnRequest: Subject<void> = new Subject<void>();
        this.isWaiting = true;

        this.edge
            .getConfig(this.websocket)
            .pipe(
                takeUntil(stopOnRequest),
                filter((config): config is NonNullable<typeof config> => config !== null),
            )
            .subscribe(async (config) => {
                stopOnRequest.next();
                stopOnRequest.complete();

                // Fetch component configurator
                this.componentConfigurator = this.ibn.getComponentConfigurator(
                    this.edge,
                    config,
                    this.websocket,
                    this.service,
                );

                const resolvedConfigurator: ComponentConfigurator | null = await this.componentConfigurator;

                if (!resolvedConfigurator) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.UNDEFINED_COMPONENT_CONFIGURATOR"),
                        "danger",
                    );
                    this.isWaiting = false;
                    this.cdr.markForCheck();
                    return;
                }

                // Add objects to component configurator
                this.configurationObjectsToBeConfigured = resolvedConfigurator.getConfigurationObjectsToBeConfigured();
                this.isAnyConfigurationObjectPreConfigured = resolvedConfigurator.anyHasConfigurationState(
                    ConfigurationState.PreConfigured,
                );
                this.isWaiting = false;

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

                this.cdr.markForCheck();
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
    public async startConfiguration(): Promise<void> {
        this.isWaiting = true;

        const resolvedConfigurator: ComponentConfigurator | null = this.componentConfigurator
            ? await this.componentConfigurator
            : null;

        if (!resolvedConfigurator) {
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.UNDEFINED_COMPONENT_CONFIGURATOR"),
                "danger",
            );
            this.isWaiting = false;
            this.cdr.markForCheck();
            return;
        }

        resolvedConfigurator
            .start()
            .then(() => {
                this.service.toast(
                    this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.SUCCESSFULLY_CONFIGURED"),
                    "success",
                );
            })
            .catch((_reason: unknown) => {
                if (!resolvedConfigurator.allHaveConfigurationState(ConfigurationState.Configured)) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.PARTIAL_CONFIGURATION"),
                        "danger",
                    );
                    return;
                }

                if (!resolvedConfigurator.allHaveFunctionState(FunctionState.Ok)) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FUNCTION_TEST_ERROR"),
                        "warning",
                    );
                    return;
                }
            })
            .finally(() => {
                this.service.toast(
                    this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.START_FUNCTION_TEST"),
                    "warning",
                    5000,
                );
                resolvedConfigurator.startFunctionTest(this.ibn, this.ibn.WAIT_FOR_BATTERY_SERIAL_NUMBERS).then(() => {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.CONFIGURATION_EXECUTE.FINISH_FUNCTION_TEST"),
                        "success",
                    );
                    this.isWaiting = false;
                    this.isNextDisabled = false;
                    this.cdr.markForCheck();
                });
            });
    }
}
