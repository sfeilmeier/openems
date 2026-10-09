// @ts-strict-ignore
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { InstallationSystem } from "../../core/installation-system";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { SystemId } from "../../shared/system";

@Component({
    selector: ConfigurationSystemVariantComponent.SELECTOR,
    templateUrl: "./configuration-system-variant.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ConfigurationSystemVariantComponent implements OnInit {
    private static readonly SELECTOR = "configuration-system-variant";

    @Input() public ibn: AbstractIbn;
    @Output() public nextViewEvent = new EventEmitter();
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();

    public form: FormGroup = new FormGroup({});
    public fields: FormlyFieldConfig[];
    public model;

    private translate: TranslateService = inject(TranslateService);

    /**
     * Determines whether the button to open the system manual should be shown. It is shown when a system variant has
     * been selected, as the manual links are specific to each system variant.
     */
    protected get showManualButton(): boolean {
        return this.form.controls.system.value != null;
    }

    public ngOnInit() {
        this.fields = this.generateFields();
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

    /** Redirects to the appropriate url for system manual. Applies to all systems. */
    protected openManual(): void {
        const systemVariant = this.form.controls.system?.value as SystemId;
        window.open(InstallationSystem.getSystemManualLink(systemVariant));
    }

    private generateFields(): FormlyFieldConfig[] {
        // A null emsType is a valid, supported state (e.g. type not yet set in Odoo) and is handled by
        // EmsTypeConfig.from() via DefaultEmsConfig. Only a missing ibn or systemType is an actual error.
        if (this.ibn?.systemType == null) {
            console.error("System type is not defined. Cannot generate form fields.");
            return [];
        }

        const emsType = this.ibn.getEmsType();

        return [
            {
                key: "system",
                type: "radio",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.CONFIGURATION_SYSTEM.PRODUCT_NAME"),
                    options: InstallationSystem.getSystemVariants(this.ibn.systemType, emsType),
                    required: true,
                },
            },
        ];
    }
}
