// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Language } from "src/app/shared/type/language";
import { environment } from "src/environments";
import { AbstractHomeIbn } from "../../installation-systems/home/abstract-home";
import { IbnUtils } from "../../shared/ibn.utils";
import { SystemId } from "../../shared/system";

@Component({
    selector: ProtocolAvuBoxComponent.SELECTOR,
    templateUrl: "./protocol-avu-box.html",
    standalone: false,
    styles: [
        `
            .image-column {
                text-align: center; /* Center-align the image */
                padding: 1rem; /* Add padding for better spacing */
            }

            .responsive-image {
                max-width: 100%; /* Ensure the image scales proportionally */
                height: auto; /* Maintain aspect ratio */
            }

            @media (max-width: 768px) {
                .image-column {
                    margin-top: 1rem; /* Add spacing between the form and image */
                }
            }
        `,
    ],
})
export class ProtocolAvuBoxComponent implements OnInit {
    private static SELECTOR: string = "protocol-avu-box";
    private static AVU_SERIAL_NUMBER_PREFIX: string = "FHA";

    @Input() public ibn: AbstractHomeIbn;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent: EventEmitter<any> = new EventEmitter();

    protected form: FormGroup = new FormGroup({});
    protected model;
    protected fields: FormlyFieldConfig[];
    protected isNextDisabled: boolean;
    protected imageLink: string | null = null;

    constructor(private translate: TranslateService) {}

    public ngOnInit() {
        this.form = new FormGroup({});
        this.initializeModel();
        this.isNextDisabled = !(this.model.yes || this.model.no);
        this.fields = this.getFields();

        const lang: string = Language.getByKey(localStorage.LANGUAGE)?.key ?? Language.DEFAULT.key;

        switch (lang) {
            case "de":
                this.imageLink = "assets/img/ibn/avu-box/home-avu-box-de.jpg";
                break;
            case "en":
            default:
                this.imageLink = "assets/img/ibn/avu-box/home-avu-box-en.png";
                break;
        }
    }

    protected onNextClicked() {
        if (this.form.invalid || !(this.model.yes || this.model.no)) {
            return;
        }

        const isIncluded = this.model.yes;
        this.ibn.avu = isIncluded
            ? {
                  isIncluded,
                  serialNumber: ProtocolAvuBoxComponent.AVU_SERIAL_NUMBER_PREFIX + this.model.serialNumber,
              }
            : {
                  isIncluded,
              };

        this.nextViewEvent.emit(this.ibn);
    }

    protected onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    private initializeModel(): void {
        if (!this.ibn.avu) {
            this.model = {
                yes: false,
                no: false,
                serialNumber: null,
            };
        } else {
            const isIncluded = this.ibn.avu.isIncluded ?? false;
            const serialNumber = this.ibn.avu.serialNumber
                ? IbnUtils.removePrefix(this.ibn.avu.serialNumber, ProtocolAvuBoxComponent.AVU_SERIAL_NUMBER_PREFIX)
                : null;

            this.model = {
                yes: isIncluded,
                no: !isIncluded,
                serialNumber,
            };
        }
    }

    /**
     * Gets the AVU manual link depending on the system's power class. FENECON Home 15 (Gen 2) uses the
     * extended-compatibility manual, all other systems (Home 6/10 (Gen 2), Home 10) use the standard manual.
     *
     * @returns The AVU manual url
     */
    private getAvuManualLink(): string {
        return this.ibn.systemId === SystemId.FENECON_HOME_15
            ? environment.links.MANUALS.AVU.EXTENDED
            : environment.links.MANUALS.AVU.STANDARD;
    }

    private getFields() {
        const fields: FormlyFieldConfig[] = [
            {
                key: "yes",
                type: "checkbox-button",
                props: {
                    label: this.translate.instant("GENERAL.YES"),
                    buttonAvailable: true,
                    buttonText: this.translate.instant("INSTALLATION.CONFIGURATION_SYSTEM.OPEN_INSTRUCTIONS"),
                    onButtonClick: () => {
                        window.open(this.getAvuManualLink());
                    },
                    required: true,
                },
                hooks: {
                    onInit: (field) => {
                        field.formControl?.valueChanges.subscribe((isChecked: boolean) => {
                            if (isChecked) {
                                this.form.controls["no"].setValue(false); // Deselect "no" if "yes" is selected
                                this.isNextDisabled = false;
                            } else if (!this.form.controls["no"].value) {
                                // If other field is also unchecked.
                                this.isNextDisabled = true;
                            }
                        });
                    },
                },
            },
            {
                key: "serialNumber",
                type: "input",
                props: {
                    label: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
                    prefix: ProtocolAvuBoxComponent.AVU_SERIAL_NUMBER_PREFIX,
                    placeholder: "xxxxxxxxx",
                    boxBorder: true,
                    required: true,
                },
                hooks: {
                    onInit: (field) => {
                        const shouldDisable = !this.model.yes;
                        if (shouldDisable) {
                            field.formControl?.disable({ emitEvent: false });
                        } else {
                            field.formControl?.enable({ emitEvent: false });
                        }
                    },
                },
                expressions: {
                    // Enable when 'yes' is checked and disable otherwise
                    "props.disabled": "!model.yes",
                },
                wrappers: ["input-serial-number"],
                validators: {
                    validation: ["boxSerialNumber"],
                },
            },
            {
                key: "no",
                type: "checkbox-button",
                props: {
                    label: this.translate.instant("GENERAL.NO"),
                    buttonAvailable: false,
                    required: true,
                },
                hooks: {
                    onInit: (field) => {
                        field.formControl?.valueChanges.subscribe((isChecked: boolean) => {
                            if (isChecked) {
                                this.form.controls["yes"].setValue(false); // Deselect "yes" if "no" is selected
                                this.isNextDisabled = false;
                            } else if (!this.form.controls["yes"].value) {
                                // If other field is also unchecked.
                                this.isNextDisabled = true;
                            }
                        });
                    },
                },
            },
        ];

        return fields;
    }
}
