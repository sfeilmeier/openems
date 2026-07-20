// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";

@Component({
    selector: ConfigurationEmergencyReserveComponent.SELECTOR,
    templateUrl: "./configuration-emergency-reserve.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ConfigurationEmergencyReserveComponent implements OnInit {
    private static readonly SELECTOR = "configuration-emergency-reserve";

    @Input() public ibn: AbstractIbn;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<any>();

    public form: FormGroup = new FormGroup({});
    public fields: FormlyFieldConfig[] = [];
    public model;

    public ngOnInit() {
        this.fields = this.ibn.getEmergencyReserveFields();
        this.model = this.ibn.emergencyReserve;
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.ibn.emergencyReserve = this.model;
        this.nextViewEvent.emit(this.ibn);
    }
}
