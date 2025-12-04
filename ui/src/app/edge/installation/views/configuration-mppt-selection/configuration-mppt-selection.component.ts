// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Commercial50Gen3Ibn } from "../../installation-systems/commercial/commercial-50/commercial-50-gen3";
import { Home10Gen2FeneconIbn } from "../../installation-systems/home/home-10-gen2";
import { Home15Gen2FeneconIbn } from "../../installation-systems/home/home-15-gen2";
import { Home20FeneconIbn } from "../../installation-systems/home/home-20";
import { Home30FeneconIbn } from "../../installation-systems/home/home-30";

@Component({
    selector: ConfigurationMpptSelectionComponent.SELECTOR,
    templateUrl: "./configuration-mppt-selection.component.html",
    standalone: false,
})
export class ConfigurationMpptSelectionComponent implements OnInit {
    private static readonly SELECTOR = "configuration-mppt-selection";

    @Input() public ibn: Home20FeneconIbn | Home30FeneconIbn | Home10Gen2FeneconIbn | Home15Gen2FeneconIbn | Commercial50Gen3Ibn;
    @Output() public nextViewEvent = new EventEmitter();
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();

    protected form: FormGroup;
    protected fields: FormlyFieldConfig[];
    protected model;
    protected isNextDisabled: boolean;

    constructor(private translate: TranslateService) { }

    public ngOnInit() {
        this.form = new FormGroup({});
        this.model = this.ibn.mppt;
        this.isNextDisabled = !this.model.connectionCheck;
        this.fields = this.getFields();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }
        this.ibn.mppt = this.model;
        this.nextViewEvent.emit(this.ibn);
    }

    public getFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];
        const maxStrings: number = this.ibn.maxNumberOfMppt > 0 ? this.ibn.maxNumberOfMppt : this.ibn.maxNumberOfPvStrings;

        for (let strings = 1; strings <= maxStrings; strings++) {

            const mppt = strings;
            const key: string = "mppt" + mppt;
            const label: string = this.ibn.getMpptLabel(mppt, strings);
            const defaultValue: boolean = this.model[key];

            fields.push({
                key: key,
                props: {
                    label: label,
                    url: this.ibn.maxNumberOfMppt > 0 ? this.ibn.getImageUrl(mppt) : this.ibn.getImageUrl(strings),
                },
                defaultValue: defaultValue,
                wrappers: ["formly-field-checkbox-with-image"],
            });
        }

        fields.push({
            key: "connectionCheck",
            type: "checkbox",
            props: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_MPPT_SELECTION.CONNECTION_CHECK_LABEL"),
                required: true,
                change: (field) => {
                    this.isNextDisabled = !field.formControl.value;
                },
            },
            defaultValue: false,
        });

        return fields;
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

}
