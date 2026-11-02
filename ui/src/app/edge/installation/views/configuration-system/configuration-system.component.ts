// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge, Websocket } from "src/app/shared/shared";
import { DocsUtils } from "src/app/shared/utils/docs/docs.utils";
import { environment } from "src/environments";
import { InstallationSystem } from "../../core/installation-system";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { GetEmsTypeRequest } from "../../jsonrpc/getEmsTypeRequest";
import { GetEmsTypeResponse } from "../../jsonrpc/getEmsTypeResponse";
import { ComponentData, EmsType } from "../../shared/ibndatatypes";
import { System, SystemType } from "../../shared/system";

@Component({
    selector: ConfigurationSystemComponent.SELECTOR,
    templateUrl: "./configuration-system.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ConfigurationSystemComponent implements OnInit {
    private static readonly SELECTOR = "configuration-system";

    @Input() public ibn: AbstractIbn;
    @Input() public edge: Edge;

    @Output() public nextViewEvent = new EventEmitter();
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();

    protected form: FormGroup;
    protected fields: FormlyFieldConfig[];
    protected model;

    private emsType: EmsType = null;

    constructor(
        private translate: TranslateService,
        private websocket: Websocket,
    ) {}

    protected get showManual(): boolean {
        return this.form.controls.type?.value && environment.theme === "Heckert";
    }

    public ngOnInit() {
        this.form = new FormGroup({});
        this.websocket
            .sendStateFullRequest(new GetEmsTypeRequest({ edgeId: this.edge.id }))
            .then((response: GetEmsTypeResponse) => {
                this.emsType = response.result.emsType ?? null;
                sessionStorage.setItem("emsType", this.emsType);
            })
            .catch((error) => {
                console.log(error);
            })
            .finally(() => {
                this.fields = this.getFields();
            });
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }
        // Sets the ibn object.
        this.setIbn();
        this.nextViewEvent.emit(this.ibn);
    }

    public getFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];
        const options: ComponentData[] = InstallationSystem.getSupportedSystemTypes(this.emsType);

        fields.push({
            key: "type",
            type: "radio",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_SYSTEM.PRODUCT_NAME"),
                type: "radio",
                options: options,
                required: true,
            },
        });
        return fields;
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    /** Redirects to the url for Heckert system manual. */
    protected openManual(): void {
        window.open(DocsUtils.replaceWithCurrentDocsLanguage(environment.links.MANUALS.SYSTEM.HOME.HOME_10));
    }

    /** Loads the appropriate Ibn object. */
    private setIbn(): void {
        const system: SystemType = this.form.controls.type.value;
        this.ibn = System.getSystemObjectFromSystemType(system, this.translate);
    }
}
