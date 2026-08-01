import { Component, DestroyRef, EventEmitter, inject, Input, OnInit, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormGroup } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { StrictFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
import { environment } from "src/environments";
import { Commercial100Ibn } from "../../installation-systems/commercial/commercial-100/commercial-100";
import { InstallationViewComponent } from "../../installation-view/installation-view.component";

interface ConfigurationBatteryInputsModel {
    hasBatteryInput1: boolean;
    hasBatteryInput2: boolean;
}

@Component({
    selector: "configuration-battery-inputs",
    templateUrl: "./configuration-battery-inputs.html",
    standalone: true,
    imports: [FormlyModule, TranslateModule, InstallationViewComponent],
})
export class ConfigurationBatteryInputsComponent implements OnInit {
    @Input() public ibn!: Commercial100Ibn;
    @Output() public previousViewEvent: EventEmitter<void> = new EventEmitter();
    @Output() public nextViewEvent: EventEmitter<Commercial100Ibn> = new EventEmitter();

    protected translate = inject(TranslateService);
    protected form = new FormGroup({});
    protected fields: StrictFormlyFieldConfig<ConfigurationBatteryInputsModel & { isInputConfirmed: boolean }>[] = [
        {
            key: "hasBatteryInput1",
            type: "checkbox",
            props: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_BATTERY_INPUTS.BATTERY_INPUT", { key: 1 }),
                required: true,
                url: environment.links.DOWNLOAD.INSTALLATION.COMMERCIAL.COMMERCIAL_100.BATTERY_INPUT_1,
                shouldSizeImageToMaxWidth: true,
            },
            hooks: {
                onInit: (field) => {
                    // Ensure that either battery 1 is selected or both battery 1 and battery 2 are selected. If battery 1 is deselected, then battery 2 must be deselected as well.
                    field.formControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
                        if (!value) {
                            field.form?.get("hasBatteryInput2")?.setValue(false);
                            this.model.hasBatteryInput2 = false;
                        }
                    });
                },
            },
            wrappers: ["formly-field-checkbox-with-image"],
        },
        {
            key: "hasBatteryInput2",
            type: "checkbox",
            props: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_BATTERY_INPUTS.BATTERY_INPUT", { key: 2 }),
                url: environment.links.DOWNLOAD.INSTALLATION.COMMERCIAL.COMMERCIAL_100.BATTERY_INPUT_2,
                shouldSizeImageToMaxWidth: true,
            },
            hooks: {
                // i need to not allow second option alone to be selected if the first option is not selected. If the first option is deselected, then the second option must be deselected as well.
                onInit: (field) => {
                    field.formControl?.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
                        if (value && !this.model.hasBatteryInput1) {
                            field.form?.get("hasBatteryInput1")?.setValue(true);
                            this.model.hasBatteryInput1 = true;
                        }
                    });
                },
            },
            wrappers: ["formly-field-checkbox-with-image"],
        },
        {
            key: "isInputConfirmed",
            type: "checkbox",
            props: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_BATTERY_INPUTS.INPUT_CONFIRMATION"),
                required: true,
            },
        },
    ];
    protected model: ConfigurationBatteryInputsModel & {
        isInputConfirmed: boolean;
    } = {
        hasBatteryInput1: false,
        hasBatteryInput2: false,
        isInputConfirmed: false,
    };
    protected disableNextView: boolean = true;
    private destroyRef = inject(DestroyRef);

    public ngOnInit(): void {
        // Restore previously selected battery inputs when navigating back to this view
        if (this.ibn?.batteryInputs) {
            this.model = {
                ...this.ibn.batteryInputs,
                isInputConfirmed: false,
            };
        }

        // Disable the next button if the form is invalid
        this.form.statusChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
            this.disableNextView = this.form.invalid;
        });
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        // Persist the battery-input selection on the ibn so the serial-numbers view can use it
        this.ibn.batteryInputs = {
            hasBatteryInput1: this.model?.hasBatteryInput1 ?? false,
            hasBatteryInput2: this.model?.hasBatteryInput2 ?? false,
        };

        this.nextViewEvent.emit(this.ibn);
    }
}
