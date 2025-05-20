// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { GetEmsTypeRequest } from "src/app/shared/jsonrpc/request/getEmsTypeRequest";
import { GetEmsTypeResponse } from "src/app/shared/jsonrpc/response/getEmsTypeResponse";
import { Edge, Websocket } from "src/app/shared/shared";
import { environment } from "src/environments";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { ComponentData, EmsType } from "../../shared/ibndatatypes";
import { System, SystemType } from "../../shared/system";

@Component({
  selector: ConfigurationSystemComponent.SELECTOR,
  templateUrl: "./configuration-system.component.html",
  standalone: false,
})
export class ConfigurationSystemComponent implements OnInit {
  private static readonly SELECTOR = "configuration-system";

  @Input() public ibn: AbstractIbn;
  @Input() public edge: Edge;

  @Output() public nextViewEvent = new EventEmitter();
  @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();

  protected form: FormGroup;
  protected fields: FormlyFieldConfig[];
  protected model;

  private emsType: EmsType = null;

  constructor(private translate: TranslateService, private websocket: Websocket) { }

  protected get showNote(): boolean {
    return this.form.controls.type?.value && (this.emsType === "fec013" || this.emsType === "feh013");
  }

  protected get showManual(): boolean {
    return this.form.controls.type?.value && (environment.theme === "Heckert" || this.showNote);
  }

  public ngOnInit() {
    this.form = new FormGroup({});
    this.websocket.sendRequest(
      new GetEmsTypeRequest({ edgeId: this.edge.id })).then((response: GetEmsTypeResponse) => {
        this.emsType = response.result.emsType ?? null;
        sessionStorage.setItem("emsType", this.emsType);
      }).catch(error => {
        console.log(error);
      }).finally(() => {
        this.fields = this.getFields();
      });
  }

  public onNextClicked() {
    if (this.form.invalid) {
      return;
    }
    // Sets the ibn object.
    this.setIbn();
    this.nextViewEvent.emit(this.ibn);
  }

  public getFields(): FormlyFieldConfig[] {
    const fields: FormlyFieldConfig[] = [];
    const options: ComponentData[] = [];

    switch (environment.theme) {
      case "Heckert":
        options.push({ value: SystemType.HECKERT_HOME, label: SystemType.HECKERT_HOME });
        break;
      case "FENECON":
      default:
        // Home stays valid for all systems, but variants will change (configuration system variant).
        switch (this.emsType) {
          case "feh013": // New type
          case null: // No type is set in Odoo
            options.push(
              { value: SystemType.FENECON_HOME, label: SystemType.FENECON_HOME },
              { value: SystemType.COMMERCIAL, label: SystemType.COMMERCIAL },
            );
            break;
          case "fho011": // old type
            options.push({ value: SystemType.FENECON_HOME, label: SystemType.FENECON_HOME });
            break;
          case "fec011":
          case "fec013":
            options.push(
              { value: SystemType.COMMERCIAL, label: SystemType.COMMERCIAL },
            );
            break;
        }
        break;
    }

    fields.push({
      key: "type",
      type: "radio",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.CONFIGURATION_SYSTEM.PRODUCT_NAME"),
        type: "radio",
        options: options,
        required: true,
      },
    });
    return fields;
  }

  public onPreviousClicked() {
    this.previousViewEvent.emit();
  }

  /**
   * Redirects to the appropriate url for Heckert system manual.
   */
  protected openManual(): void {
    const system: SystemType = this.form.controls.type.value;
    window.open(System.getManualLinkFromSystemType(system, this.emsType));
  }

  /**
   * Loads the appropriate Ibn object.
   */
  private setIbn(): void {
    const system: SystemType = this.form.controls.type.value;
    this.ibn = System.getSystemObjectFromSystemType(system, this.translate, this.emsType);
  }

}
