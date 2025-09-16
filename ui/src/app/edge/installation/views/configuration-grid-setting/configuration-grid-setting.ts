// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { Commercial50Gen3Ibn } from "../../installation-systems/commercial/commercial-50/commercial-50-gen3";
import { Commercial92Ibn } from "../../installation-systems/commercial/commercial-92/commercial92";

@Component({
    selector: ConfigurationGridSettingComponent.SELECTOR,
    templateUrl: "./configuration-grid-setting.html",
    standalone: false,
})
export class ConfigurationGridSettingComponent implements OnInit {

    private static readonly SELECTOR = "configuration-grid-setting";

    @Input() public ibn: Commercial92Ibn | Commercial50Gen3Ibn;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<any>();

    protected form: FormGroup;
    protected fields: FormlyFieldConfig[];
    protected model;

    public ngOnInit(): void {

        this.form = new FormGroup({});
        this.model = { gridSetting: this.ibn.gridSetting ?? null }; // Initialize the model
        this.fields = this.getFields();
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }

        this.ibn.gridSetting = this.model.gridSetting;
        this.nextViewEvent.emit(this.ibn);
    }

    private getFields() {
        return [
            {
                key: "gridSetting",
                type: "radio",
                templateOptions: {
                    radioSlot: "start",
                    options: this.ibn.getGridSettingOptions(),
                    required: true,
                },
            },
        ];
    }
}
