// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";

@Component({
    selector: ConfigurationEssLimiter14aComponent.SELECTOR,
    templateUrl: "./configuration-ess-limiter-14a.html",
    standalone: false,
})
export class ConfigurationEssLimiter14aComponent implements OnInit {

    private static readonly SELECTOR = "configuration-ess-limiter-14a";

    @Input() public ibn: AbstractIbn;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<any>();

    public form: FormGroup;
    public fields: FormlyFieldConfig[];
    public model;

    constructor(private translate: TranslateService) { }

    public ngOnInit() {
        this.form = new FormGroup({});
        this.fields = this.getFields();
        this.model = {
            isController14aActivated: this.ibn.isController14aActivated,
        };
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }

        this.ibn.isController14aActivated = this.model.isController14aActivated;
        this.nextViewEvent.emit(this.ibn);
    }

    public getFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "isController14aActivated",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_ESS_LIMITER.IS_ACTIVATE"),
            },
            defaultValue: this.ibn.isController14aActivated,
        });

        return fields;
    }

}
