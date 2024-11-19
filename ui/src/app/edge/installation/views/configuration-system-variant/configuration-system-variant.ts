// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { HomeSystemId, System, SystemId } from "../../shared/system";

@Component({
    selector: ConfigurationSystemVariantComponent.SELECTOR,
    templateUrl: "./configuration-system-variant.html",
})
export class ConfigurationSystemVariantComponent implements OnInit {

    private static readonly SELECTOR = "configuration-system-variant";

    @Input() public ibn: AbstractIbn;
    @Output() public nextViewEvent = new EventEmitter();
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();

    public form: FormGroup;
    public fields: FormlyFieldConfig[];
    public model;

    /**
    * Displays the button for home systems, otherwise false.
    *
    * @returns {boolean} True if the selected system is a home system, false otherwise.
       *
    * @remarks
     * This getter is used to determine whether the system selected in the form is one of the predefined home systems.
    * It checks if the selected system value exists and is included in the `homeSystemIds` array.
    *
    */
    protected get showManualButton(): boolean {
        const selectedSystem: SystemId = this.form.controls.system?.value;
        return System.isHomeSystemSelected(selectedSystem);
    }

    public ngOnInit() {
        this.form = new FormGroup({});
        this.fields = this.ibn.getSystemVariantFields();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }
        // Sets the ibn object.
        const system = this.form.controls.system.value;
        this.ibn = this.ibn.setIbn(system);

        this.ibn.showViewCount = true;
        this.nextViewEvent.emit(this.ibn);
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    /**
     * Redirects to the appropriate url for system manual.
     * Apples only to Home systems.
     */
    protected openManual(): void {
        const homeSystemVariant = this.form.controls.system?.value as HomeSystemId;
        window.open(System.getHomeSystemInstructionsLink(homeSystemVariant));
    }

}
