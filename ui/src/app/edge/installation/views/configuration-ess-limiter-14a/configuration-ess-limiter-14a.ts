// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { AbstractHomeIbn } from "../../installation-systems/home/abstract-home";

@Component({
    selector: ConfigurationEssLimiter14aComponent.SELECTOR,
    templateUrl: "./configuration-ess-limiter-14a.html",
})
export class ConfigurationEssLimiter14aComponent implements OnInit {

    private static readonly SELECTOR = "configuration-ess-limiter-14a";

    @Input() public ibn: AbstractHomeIbn;
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
            activateLimitController14a: this.ibn.activateLimitController14a,
        };
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }

        this.ibn.activateLimitController14a = this.model.activateLimitController14a;
        this.nextViewEvent.emit(this.ibn);
    }

    public getFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "activateLimitController14a",
            type: "checkbox",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_ESS_LIMITER.IS_ACTIVATE"),
            },
            defaultValue: this.ibn.activateLimitController14a,
        });

        return fields;
    }

}
