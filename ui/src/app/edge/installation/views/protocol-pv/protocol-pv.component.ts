import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { distinctUntilChanged, tap } from "rxjs";
import { Utils } from "src/app/shared/shared";
import { AbstractHomeIbn } from "../../installation-systems/home/abstract-home";
import { DcForm } from "../../shared/ibndatatypes";
import { DIRECTIONS_OPTIONS } from "../../shared/options";

interface ProtocolForm extends DcForm {
    uiLabel: string;
    mpptIndex: number;
}

@Component({
    selector: "protocol-pv",
    templateUrl: "./protocol-pv.component.html",
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: [
        `
            .text-small {
                font-size: 0.875rem;
            }
        `,
    ],
})
export class ProtocolPvComponent implements OnInit {
    @Input() public ibn!: AbstractHomeIbn;
    @Output() public previousViewEvent = new EventEmitter<void>();
    @Output() public nextViewEvent = new EventEmitter<AbstractHomeIbn>();

    protected forms: Array<ProtocolForm> = [];
    protected expandedAccordions: string[] = [];
    private maxStrings: number = 0;

    public constructor(private translate: TranslateService) {}

    public ngOnInit() {
        // Initialize Data
        this.ibn.pv ??= {};
        this.ibn.pv.dc ??= [];

        this.maxStrings = this.ibn.maxNumberOfMppt > 0 ? this.ibn.maxNumberOfMppt : this.ibn.maxNumberOfPvStrings;

        for (let i = 0; i < this.maxStrings; i++) {
            const mpptNumber = i + 1;
            const mpptKey = "mppt" + mpptNumber;
            const isEnabled = this.ibn.mppt ? this.ibn.mppt[mpptKey] === true : true;
            let model = { isSelected: false }; // Default

            if (isEnabled) {
                const existingDc = this.ibn.pv?.dc?.[i];
                model = existingDc ?? { isSelected: true };
            }

            const formGroup = new FormGroup({});
            const label = this.ibn.getMpptLabel(mpptNumber);

            const form: ProtocolForm = {
                formGroup,
                model,
                fields: isEnabled ? this.createFields(i, mpptNumber) : [],
                uiLabel: label,
                mpptIndex: i,
            };

            this.forms.push(form);
        }

        const firstEnabledIndex = this.forms.findIndex((f) => f.fields.length > 0);

        if (firstEnabledIndex > -1) {
            // We use +1 because HTML uses (i + 1) for the ID.
            this.expandedAccordions = [`mppt-${firstEnabledIndex + 1}`];
        }
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        let isValid = true;

        // Iterate over forms and prohibit onNextClicked if forms are not valid
        for (const form of this.forms) {
            if (form.formGroup.invalid) {
                form.formGroup.markAllAsTouched();
                isValid = false;
            }
        }

        if (!isValid) {
            return;
        }

        // Reset and rebuild the DC array
        // We ensure 'pv' exists first
        if (!this.ibn.pv) {
            this.ibn.pv = {};
        }
        this.ibn.pv!.dc = [];

        for (let formNr = 0; formNr < this.forms.length; formNr++) {
            if (this.isMpptEnabled(formNr)) {
                this.ibn.pv!.dc.push(Utils.deepCopy(this.forms[formNr].model));
            } else {
                // Push placeholder to maintain index alignment
                this.ibn.pv.dc.push({ isSelected: false });
            }
        }
        this.nextViewEvent.emit(this.ibn);
    }

    private isMpptEnabled(index: number): boolean {
        // If no mppt config object exists (legacy systems), assume true
        if (!this.ibn.mppt) {
            return true;
        }

        return this.ibn.mppt["mppt" + (index + 1)] === true;
    }

    private createFields(index: number, mpptNumber: number): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [
            {
                key: "isSelected",
                type: "checkbox",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.ENABLE_MPPT", { mpptNumber }),
                },
                hooks: {
                    onInit: (field) => {
                        return field.formControl?.valueChanges.pipe(
                            // distinctUntilChanged prevents duplicate triggers
                            distinctUntilChanged(),
                            tap((isSelected: boolean) => {
                                if (isSelected) {
                                    this.handleCopyLogic(index);
                                }
                            }),
                        );
                    },
                },
            },
            {
                key: "alias",
                type: "input",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.PROTOCOL_PV.ALIAS"),
                    description: this.translate.instant("INSTALLATION.PROTOCOL_PV.ALIAS_DESCRIPTION_PV"),
                    required: true,
                },
                hideExpression: (model) => !model.isSelected,
            },
            {
                key: "value",
                type: "input",
                defaultValue: 1000,
                templateOptions: {
                    type: "number",
                    label:
                        this.ibn.maxNumberOfMppt > 0
                            ? this.translate.instant("INSTALLATION.PROTOCOL_PV.INSTALLED_POWER_PER_STRING")
                            : this.translate.instant("INSTALLATION.PROTOCOL_PV.INSTALLED_POWER"),
                    required: true,
                },
                validators: {
                    validation: ["onlyPositiveInteger", "defaultAsMinimumValue"],
                },
                hideExpression: (model) => !model.isSelected,
            },
            {
                key: "orientation",
                type: "select",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.PROTOCOL_PV.ORIENTATION"),
                    options: DIRECTIONS_OPTIONS(this.translate),
                },
                hideExpression: (model) => !model.isSelected,
            },
            {
                key: "moduleType",
                type: "input",
                templateOptions: {
                    label: this.translate.instant("INSTALLATION.PROTOCOL_PV.MODULE_TYPE"),
                    description: this.translate.instant("INSTALLATION.PROTOCOL_PV.MODULE_TYPE_DESCRIPTION"),
                },
                hideExpression: (model) => !model.isSelected,
            },
            {
                key: "modulesPerString",
                type: "input",
                templateOptions: {
                    type: "number",
                    label:
                        this.ibn.maxNumberOfMppt > 0
                            ? this.translate.instant("INSTALLATION.PROTOCOL_PV.NUMBER_OF_MODULES_PER_STRING")
                            : this.translate.instant("INSTALLATION.PROTOCOL_PV.NUMBER_OF_MODULES"),
                },
                parsers: [Number],
                hideExpression: (model) => !model.isSelected,
            },
        ];

        // Ports Connected Logic
        if (this.ibn.maxNumberOfMppt > 0) {
            fields.push({
                key: "portsConnected",
                type: "checkbox",
                props: {
                    label: this.translate.instant("INSTALLATION.PROTOCOL_PV.BOTH_SELECTED_LABEL", {
                        pv1: index * 2 + 1,
                        pv2: index * 2 + 2,
                    }),
                },
                hideExpression: (model) => !model.isSelected,
            });
        }

        return fields;
    }

    private handleCopyLogic(currentIndex: number): void {
        if (currentIndex === 0) {
            return;
        }

        const previousForm = this.forms[currentIndex - 1];
        const currentForm = this.forms[currentIndex];

        if (previousForm && previousForm.model.isSelected) {
            const { value, moduleType, modulesPerString } = previousForm.formGroup.value;
            // Patching checks for undefined automatically usually
            currentForm.formGroup.patchValue({
                value,
                moduleType,
                modulesPerString,
            });
        }
    }
}
