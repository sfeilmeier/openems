import { inject } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { AbstractFormlyComponent, OeFormlyField, ViewContext, } from "src/app/shared/components/shared/oe-formly-component";
import { EdgeConfig, Websocket } from "src/app/shared/shared";
import { ChannelAddress } from "src/app/shared/type/channeladdress";
import { AssertionUtils } from "src/app/shared/utils/assertions/assertions.utils";
import { SystemIndustrialJsonRpcHelper } from "../system-industrial-json-rpc-helper";
import { BmsHardResetRequest } from "./jsonrpc/bmsHardReset";
import { ClearErrorRequest } from "./jsonrpc/clearErrorRequest";
import { SystemErrorAcknowledge } from "./jsonrpc/systemErrorAcknowledge";
import { TestMode } from "./jsonrpc/testMode";
import { TestModeType } from "./jsonrpc/testModeType";

export abstract class AbstractIndustrialComponent extends AbstractFormlyComponent {
    protected override formlyWrapper: "formly-field-modal" | "formly-field-navigation" = "formly-field-navigation";
    protected component: EdgeConfig.Component | null = null;
    protected startStopChannel: ChannelAddress | null = null;
    private websocket: Websocket = inject(Websocket);
    protected abstract readonly factoryId: string;

    protected async loadComponentFromConfig(): Promise<EdgeConfig.Component> {
        const config = await this.service.getConfig();
        const component = config.getFirstComponentByFactoryId(this.factoryId);
        AssertionUtils.assertIsDefined(component);
        this.component = component;
        return component;
    }

    protected loadComponentFromCurrentEdge(): EdgeConfig.Component {
        const config = this.service.currentEdge()?.getCurrentConfig();
        AssertionUtils.assertIsDefined(config);
        const component = config.getFirstComponentByFactoryId(this.factoryId);
        AssertionUtils.assertIsDefined(component);
        this.component = component;
        return component;
    }

    protected loadComponentFromViewContext(viewContext: ViewContext): EdgeConfig.Component {
        AssertionUtils.assertIsDefined(viewContext.config);
        const component = viewContext.config.getFirstComponentByFactoryId(this.factoryId);
        AssertionUtils.assertIsDefined(component);
        this.component = component;
        return component;
    }

    protected override async getChannelAddresses(): Promise<ChannelAddress[]> {
        const component = await this.loadComponentFromConfig();
        this.startStopChannel = new ChannelAddress(component.id, "_PropertyStartStop");
        return [this.startStopChannel];
    }

    protected override getFormGroup(): FormGroup {
        const component = this.loadComponentFromCurrentEdge();
        return new FormGroup({
            startStop: new FormControl(component.properties.startStop),
        });
    }

    protected createDefaultStartStop(translate: TranslateService): OeFormlyField[] {
        return [
            {
                type: "name-line",
                name: translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.OVERALL_SYSTEM"),
            },
            {
                type: "info-line",
                name: translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.INDUSTRIAL.NOTE"),
                icon: {
                    name: "information-outline",
                    color: "primary",
                    size: "small",
                },
                style: { name: { fontSize: "small" } },
            },
            {
                type: "buttons-from-form-control-line",
                name: translate.instant("GENERAL.MODE"),
                controlName: "startStop",
                buttons: [
                    {
                        name: "START",
                        value: "START",
                        icon: {
                            color: "success",
                            name: "play-outline",
                            size: "medium",
                        },
                    },
                    {
                        name: "STOP",
                        value: "STOP",
                        icon: {
                            color: "danger",
                            name: "stop-outline",
                            size: "medium",
                        },
                    },
                ],
            },
        ];
    }

    protected systemErrorAcknowledge(this: AbstractIndustrialComponent): () => void {
        return SystemIndustrialJsonRpcHelper.createRpcCallback(
            this.service,
            this.translate,
            this.websocket,
            this.service.currentEdge(),
            this.component,
            new SystemErrorAcknowledge(),
        );
    }

    protected bmsHardReset(this: AbstractIndustrialComponent): () => void {
        return SystemIndustrialJsonRpcHelper.createRpcCallback(
            this.service,
            this.translate,
            this.websocket,
            this.service.currentEdge(),
            this.component,
            new BmsHardResetRequest(),
        );
    }

    protected clearErrorRequest(this: AbstractIndustrialComponent): () => void {
        return SystemIndustrialJsonRpcHelper.createRpcCallback(
            this.service,
            this.translate,
            this.websocket,
            this.service.currentEdge(),
            this.component,
            new ClearErrorRequest(),
        );
    }

    protected testMode(this: AbstractIndustrialComponent, testMode: TestModeType): () => void {
        return SystemIndustrialJsonRpcHelper.createRpcCallback(
            this.service,
            this.translate,
            this.websocket,
            this.service.currentEdge(),
            this.component,
            new TestMode(testMode),
        );
    }

    protected testModeExit(): () => void {
        return this.testMode(TestModeType.EXIT);
    }

    protected testModeManualBatteryStart(): () => void {
        return this.testMode(TestModeType.MANUAL_BATTERY_START);
    }

    protected testModeEssTest(): () => void {
        return this.testMode(TestModeType.ESS_TEST);
    }

    protected testModeLampTest(): () => void {
        return this.testMode(TestModeType.LAMP_TEST);
    }

    protected addActionButton(
        lines: OeFormlyField[],
        translate: TranslateService,
        callback: () => void,
        name: string,
        translationKey: string,
    ): void {
        lines.push(
            {
                type: "horizontal-line",
            },
            {
                type: "button-from-form-control-line",
                button: {
                    icon: {
                        name: "send-outline",
                        color: "primary",
                        size: "small",
                    },
                    name: translate.instant(translationKey),
                    value: true,
                    callback,
                },
                name,
            },
        );
    }

    protected addResetButton(
        lines: OeFormlyField[],
        translate: TranslateService,
        callback: () => void,
        name: string,
    ): void {
        this.addActionButton(lines, translate, callback, name, "GENERAL.RESET");
    }

    protected addExecuteButton(
        lines: OeFormlyField[],
        translate: TranslateService,
        callback: () => void,
        name: string,
    ): void {
        this.addActionButton(lines, translate, callback, name, "EDGE.INDEX.WIDGETS.SYSTEM.EXECUTE");
    }
}
