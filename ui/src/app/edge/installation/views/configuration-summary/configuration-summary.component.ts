// @ts-strict-ignore
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge, Service } from "src/app/shared/shared";
import { environment } from "src/environments";
import { COUNTRY_OPTIONS } from "../../../../shared/type/country";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { Category } from "../../shared/category";
import { IbnUtils } from "../../shared/ibn.utils";
import { ComponentData, TableData } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { WebLinkUtils } from "../../shared/weblink.utils";

@Component({
    selector: ConfigurationSummaryComponent.SELECTOR,
    templateUrl: "./configuration-summary.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ConfigurationSummaryComponent implements OnInit {
    private static readonly SELECTOR = "configuration-summary";

    @Input() public ibn: AbstractIbn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<any>();

    protected form: FormGroup;
    protected fields: FormlyFieldConfig[];
    protected model;
    protected tableData: { header: string; rows: ComponentData[] }[] = [];

    constructor(
        private service: Service,
        private translate: TranslateService,
    ) {}

    public async ngOnInit(): Promise<void> {
        this.form = new FormGroup({});
        this.fields = this.getFields();
        this.model = {};
        this.generateTableData();
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (!this.model.isGuaranteeConditionsAccepted) {
            this.service.toast(this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.ACCEPT_TERMS"), "warning");
            return;
        }
        if (!this.model.isDevicesActiveChecked) {
            this.service.toast(
                this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.IS_DEVICE_ACTIVE_CHECKED"),
                "warning",
            );
            return;
        }
        this.nextViewEvent.emit();
    }

    public getFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "isGuaranteeConditionsAccepted",
            type: "checkbox",
            props: {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.WARRANTY_TERMS"),
                required: true,
                defaultValue: false,
                description: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.ACCEPT"),
                url: WebLinkUtils.getLink(this.ibn.warrantyLink),
            },
            // User must explicitly accept the warranty terms to continue
            validators: {
                validation: ["checkbox-required-checked"],
            },
            wrappers: ["form-field-checkbox-hyperlink"],
        });

        fields.push({
            key: "isDevicesActiveChecked",
            type: "checkbox",
            templateOptions: {
                label: this.ibn.isDevicesActiveCheckedLabel,
                required: true,
            },
            // User must explicitly confirm devices are active to continue
            validators: {
                validation: ["checkbox-required-checked"],
            },
        });

        return fields;
    }

    /**
     * Returns the country label selected.
     *
     * @param countryValue The country value.
     * @returns Country label.
     */
    public getCountryLabel(countryValue: string) {
        return COUNTRY_OPTIONS(this.translate).find((country) => country.value === countryValue)?.label ?? "";
    }

    /** Collect all the data for summary. */
    public generateTableData() {
        const tableData: TableData[] = [];
        const edgeData = this.edge.id;
        const generalData: ComponentData[] = [
            {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.TIME_OF_INSTALLATION"),
                value: new Date().toLocaleString(),
            },
            {
                label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.EDGE_NUMBER", {
                    edgeShortName: environment.edgeShortName,
                }),
                value: edgeData,
            },
        ];

        tableData.push({
            header: Category.GENERAL,
            rows: generalData,
        });

        tableData.push({
            header: Category.INSTALLER,
            rows: IbnUtils.fillData(this.ibn.installer, Category.INSTALLER, this.translate),
        });

        tableData.push({
            header: Category.CUSTOMER,
            rows: IbnUtils.fillData(this.ibn.customer, Category.CUSTOMER, this.translate),
        });

        if (!this.ibn.location.isEqualToCustomerData) {
            tableData.push({
                header: Category.BATTERY_LOCATION,
                rows: IbnUtils.fillData(this.ibn.location, Category.BATTERY_LOCATION, this.translate),
            });
        }

        const lineSideMeterFuseRows: ComponentData[] = [];

        // Grid connection point meter type is only relevant for line side meter fuse categories other than home.
        if (
            this.ibn.lineSideMeterFuse.category !== Category.LINE_SIDE_METER_FUSE_HOME &&
            this.ibn.lineSideMeterFuse.meterType
        ) {
            lineSideMeterFuseRows.push({
                label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.METER"),
                value: Meter.toGridMeterLabel(this.ibn.lineSideMeterFuse.meterType, this.ibn.systemId),
            });
        }

        const lineSideMeterFuseValue: number | null =
            this.ibn.lineSideMeterFuse.otherValue ?? this.ibn.lineSideMeterFuse.fixedValue;
        if (lineSideMeterFuseValue != null) {
            lineSideMeterFuseRows.push({
                label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.VALUE"),
                value: this.ibn.lineSideMeterFuse.otherValue ?? this.ibn.lineSideMeterFuse.fixedValue,
            });
        }

        if (lineSideMeterFuseRows.length > 0) {
            tableData.push({
                header: Category.GRID,
                rows: lineSideMeterFuseRows,
            });
        }

        this.ibn.addSystemSpecificFields(tableData);

        // Deepcopy to local tableData to the this.tabledata by repalcing category with translated string.
        this.tableData = tableData.map((element) => {
            return {
                header: Category.toTranslatedString(element.header, this.translate),
                rows: element.rows,
            };
        });

        this.tableData = IbnUtils.groupDatasetsByHeader(this.tableData);
    }
}
