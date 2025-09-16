// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
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
import { WebLinkUtils } from "../../shared/weblink.utils";

@Component({
  selector: ConfigurationSummaryComponent.SELECTOR,
  templateUrl: "./configuration-summary.component.html",
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
  ) { }

  public ngOnInit(): void {
    this.form = new FormGroup({});
    this.fields = this.getFields();
    this.model = {};
    this.generateTableData();
  }

  public onPreviousClicked() {
    this.previousViewEvent.emit();
  }

  public onNextClicked() {
    if (!this.model.isAgbAccepted || !this.model.isGuaranteeConditionsAccepted) {
      this.service.toast("Akzeptieren Sie die AGB und Garantiebedingungen um fortzufahren.", "warning");
      return;
    }
    if (!this.model.isDevicesActiveChecked) {
      this.service.toast("Prüfen Sie, ob Batterie und Wechselrichter eingeschaltet sind und bestätigen Sie dies.", "warning");
      return;
    }
    this.nextViewEvent.emit();
  }

  public getFields(): FormlyFieldConfig[] {

    const fields: FormlyFieldConfig[] = [];
    fields.push({
      key: "isAgbAccepted",
      type: "checkbox",
      props: {
        label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.GTC_ACCEPT"),
        required: true,
        description: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.ACCEPT"),
        url: WebLinkUtils.getLink(this.ibn.gtcAndWarrantyLinks.gtcLink),
      },
      wrappers: ["form-field-checkbox-hyperlink"],
    });

    fields.push({
      key: "isGuaranteeConditionsAccepted",
      type: "checkbox",
      props: {
        label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.WARRANTY_TERMS"),
        required: true,
        defaultValue: false,
        description: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.ACCEPT"),
        url: WebLinkUtils.getLink(this.ibn.gtcAndWarrantyLinks.warrantyLink),
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
    });

    return fields;
  }

  /**
 * Returns the country label selected.
 *
 * @param countryValue the country value.
 * @returns country label.
 */
  public getCountryLabel(countryValue: string) {
    return COUNTRY_OPTIONS(this.translate).find((country) => country.value === countryValue)?.label ?? "";
  }

  /**
   * Collect all the data for summary.
   */
  public generateTableData() {
    const tableData: TableData[] = [];
    const edgeData = this.edge.id;
    const generalData: ComponentData[] = [
      { label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.TIME_OF_INSTALLATION"), value: (new Date()).toLocaleString() },
      { label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.EDGE_NUMBER", { edgeShortName: environment.edgeShortName }), value: edgeData },
    ];

    const lineSideMeterFuseTitle: string = Category.toTranslatedString(this.ibn.lineSideMeterFuse.category, this.translate);
    const lineSideMeterFuseValue: number | null = this.ibn.lineSideMeterFuse.otherValue ?? this.ibn.lineSideMeterFuse.fixedValue;
    if (lineSideMeterFuseValue != null) {
      generalData.push({ label: lineSideMeterFuseTitle, value: this.ibn.lineSideMeterFuse.otherValue ?? this.ibn.lineSideMeterFuse.fixedValue });
    }

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

    this.ibn.addSystemSpecificFields(tableData);

    // Deepcopy to local tableData to the this.tabledata by repalcing category with translated string.
    this.tableData = tableData.map((element) => {
      return {
        header: Category.toTranslatedString(element.header, this.translate),
        rows: element.rows,
      };
    });
  }

}
