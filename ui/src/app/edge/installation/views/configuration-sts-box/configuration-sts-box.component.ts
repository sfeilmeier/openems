import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { TypedFormlyFieldConfig } from "src/app/shared/components/formly/formly-utils";
import { Edge } from "src/app/shared/shared";
import { environment } from "src/environments";
import { AbstractCommercialGen3, EmergencyModel } from "../../installation-systems/commercial/abstract-commercial-gen3";

@Component({
    selector: ConfigurationStsBoxComponent.SELECTOR,
    templateUrl: "./configuration-sts-box.component.html",
    standalone: false,
    changeDetection: ChangeDetectionStrategy.Eager,
    styleUrl: "../../installation.component.scss",
})
export class ConfigurationStsBoxComponent implements OnInit {
    public static readonly SELECTOR = "configuration-sts-box";

    @Input() public ibn!: AbstractCommercialGen3;
    @Input() public edge!: Edge;
    @Output() public nextViewEvent = new EventEmitter<AbstractCommercialGen3>();
    @Output() public previousViewEvent = new EventEmitter<void>();

    protected form: FormGroup = new FormGroup({});
    protected fields: TypedFormlyFieldConfig<EmergencyModel>[] = [];
    protected model!: EmergencyModel;

    constructor(private translate: TranslateService) {}

    ngOnInit(): void {
        this.form = new FormGroup({});
        this.fields = this.getStsBoxFields();
        this.model = this.ibn.emergencyReserve;
    }

    public onNextClicked(): void {
        if (this.form.invalid) {
            return;
        }

        if (this.model.isStsBoxAvailable && !this.model.stsBoxSerialNumber) {
            return;
        }

        this.ibn.emergencyReserve = this.model;
        this.nextViewEvent.emit(this.ibn);
    }

    public onPreviousClicked(): void {
        this.previousViewEvent.emit();
    }

    public getStsBoxFields(): TypedFormlyFieldConfig<EmergencyModel>[] {
        const fields: TypedFormlyFieldConfig<EmergencyModel>[] = [];

        fields.push({
            key: "isStsBoxAvailable",
            type: "checkbox",
            props: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_STS_BOX.STS_BOX_FIELD_LABEL"),
                url: environment.links.DOWNLOAD.INSTALLATION.COMMERCIAL.STS_BOX,
                imagePositionToLeft: true,

                serialNumberField: {
                    key: "stsBoxSerialNumber",
                    label: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
                    placeholder: "xxxxxxxxxxxxxxxx",
                    required: true,
                    helpText: this.translate.instant("INSTALLATION.CONFIGURATION_STS_BOX.HELP_TEXT"),
                },
            },
            wrappers: ["formly-field-checkbox-with-image"],
            validators: {
                validation: ["serialNumberRequiredWhenChecked"],
            },
        });

        fields.push(...this.ibn.getEmergencyReserveFields());

        return fields;
    }
}
