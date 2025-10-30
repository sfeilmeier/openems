// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";

@Component({
    selector: ConfigurationEmergencyReserveComponent.SELECTOR,
    templateUrl: "./configuration-emergency-reserve.component.html",
    standalone: false,
})
export class ConfigurationEmergencyReserveComponent implements OnInit {

    private static readonly SELECTOR = "configuration-emergency-reserve";

    @Input() public ibn: AbstractIbn;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<any>();

    public form: FormGroup;
    public fields: FormlyFieldConfig[];
    public model;

    constructor(private translate: TranslateService) { }

    public ngOnInit() {

        this.form = new FormGroup({});
        this.fields = this.ibn.getEmergencyReserveFields();
        this.model = this.ibn.emergencyReserve ?? {
            isEnabled: true,
            value: 20,
            isReserveSocEnabled: false,
        };
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {

        if (this.form.invalid) {
            return;
        }

        this.ibn.emergencyReserve = this.model;
        this.nextViewEvent.emit(this.ibn);
    }

    public setEmergencyReserve(model: any) {
        this.ibn.emergencyReserve = model;
    }
}
