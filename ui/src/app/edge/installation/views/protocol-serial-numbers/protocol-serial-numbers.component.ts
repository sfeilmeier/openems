// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { Commercial92Ibn } from "../../installation-systems/commercial/commercial-92/commercial92";
import { ComponentData, SerialNumberFormData } from "../../shared/ibndatatypes";

@Component({
  selector: ProtocolSerialNumbersComponent.SELECTOR,
  templateUrl: "./protocol-serial-numbers.component.html",
  standalone: false,
})
export class ProtocolSerialNumbersComponent implements OnInit {
  private static readonly SELECTOR = "protocol-serial-numbers";

  @Input() public ibn: AbstractIbn;
  @Input() public edge: Edge;
  @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
  @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

  protected forms: SerialNumberFormData[];

  protected batterySettingsForms: {
    formGroup: FormGroup,
    fields: FormlyFieldConfig[],
    model: any
  }[] = [];

  protected numberOfTowersPerBattery: number[] = [];
  protected numberOfModulesPerTowerPerBattery: number[] = [];

  protected spinnerId: string;
  protected isWaiting = false;

  protected isCommercial92: boolean | null = null;
  private duplicateSerialNumbers: string[] = [];

  constructor(
    private service: Service,
    private websocket: Websocket,
    private translate: TranslateService,
  ) { }

  public ngOnInit() {

    // Start spinner
    this.spinnerId = "installation-serial-number-spinner";
    this.isCommercial92 = this.ibn instanceof Commercial92Ibn;
    this.setIsWaiting(true);

    this.ibn.getPreSettingInformationFromEdge(this.edge, this.websocket).then((settingsArray) => {
      // Assume settingsArray is an array for each battery
      settingsArray.forEach((settings, index) => {
        this.numberOfTowersPerBattery[index] = settings.numberOfTowers;
        this.numberOfModulesPerTowerPerBattery[index] = settings.numberOfModulesPerTower;

        const formGroup = new FormGroup({});
        const fields = this.ibn.getPreSettingsFields(settings.numberOfModulesPerTower, settings.numberOfTowers);
        const model = { ...settings };

        this.batterySettingsForms.push({ formGroup, fields, model });
      });

      this.initializeAllFields().then(() => {
        this.setIsWaiting(false);
      }).then(() => {
        this.batterySettingsForms.forEach((form) => {
          if (form.model.numberOfModulesPerTowerPerBattery < this.ibn.defaultNumberOfModules) {
            this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.READ_DESCRIPTION"), "danger");
          }
        });
      });
    });
  }

  public onPreviousClicked() {
    this.previousViewEvent.emit();
  }

  public onNextClicked() {
    if (!this.batterySettingsForms.every(form => form.formGroup.valid)) {
      this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.READ_DESCRIPTION"), "danger");
      return;
    }

    for (const form of this.forms) {
      for (const fieldSetting of form.fieldSettings) {
        if (fieldSetting.form.invalid) {
          this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.INVALID_SERIALNUMBER_KEY", { key: fieldSetting.key, header: form.header }), "danger", 5000);
          return;
        }
      }
      if (form.formTower.invalid) {
        return;
      }
    }

    this.ibn.serialNumbers = {
      numberOfTowers: this.numberOfTowersPerBattery,
      numberOfModulesPerTower: this.numberOfModulesPerTowerPerBattery,
      batteriesData: [],
    };

    for (const form of this.forms) {
      let serialNumbers: ComponentData[] = [];
      serialNumbers = this.extractSerialNumbers(form.fieldSettings);
      this.ibn.serialNumbers.batteriesData.push({
        label: form.header,
        modules: serialNumbers,
      });
    }

    // Duplicates check.
    if (this.duplicateSerialNumbers.length !== 0) {
      this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.SAME_SERIAL_NUMBERS", { serialNumbers: this.duplicateSerialNumbers }), "warning");
      return;
    }

    this.nextViewEvent.emit(this.ibn);
  }

  public setIsWaiting(isWaiting: boolean) {
    this.isWaiting = isWaiting;

    if (isWaiting) {
      this.service.startSpinner(this.spinnerId);
    } else {
      this.service.stopSpinner(this.spinnerId);
    }
  }

  /**
   * Initializes all fields such as number of tower and modules per tower and
   * also indiviaul components fo the system and modules.
   * All the information that can be read directly are read directly from the registers.
   *
   * @returns The Settings fields for towers and also individual modules fields.
   */
  public initializeAllFields(): Promise<void> {
    return new Promise((resolve) => {
      // Map each battery to its promises (towers)
      const promisesArrays = this.numberOfTowersPerBattery.map((numberOfTowers, index) => {
        const slaveNr = index + 1; // Convert 0-based index to 1-based slave number
        const numberOfModulesPerTower = this.numberOfModulesPerTowerPerBattery[index];
        return this.ibn.readSerialNumbersFromRegisters(
          this.edge, this.websocket, numberOfTowers, numberOfModulesPerTower, slaveNr
        );
      });

      // Flatten array of arrays into single promise array
      const flattenedPromises = promisesArrays.flat();

      Promise.all(flattenedPromises).then((modelsArray) => {
        this.forms = [];
        let modelIndex = 0;

        // Iterate through each battery's configuration
        this.numberOfTowersPerBattery.forEach((numberOfTowers, batteryIndex) => {
          const batteryNr = batteryIndex + 1;
          const numberOfModulesPerTower = this.numberOfModulesPerTowerPerBattery[batteryIndex];

          // Create form entries for each tower in the battery
          for (let towerIndex = 0; towerIndex < numberOfTowers; towerIndex++) {
            const model = modelsArray[modelIndex];
            this.forms.push({
              fieldSettings: this.ibn.getSerialNumberFields(towerIndex, numberOfModulesPerTower, batteryNr),
              model: model,
              formTower: new FormGroup({}),
              header: this.ibn.getSerialNumberCategoryHeader(batteryNr, towerIndex),
            });
            modelIndex++;
          }
        });

        resolve();
      });
    });
  }

  /**
 * Updates the tower and module information based on manual update.
 *
 * @returns the updated number of towers and modules per tower.
 */
  public saveSettings() {
    const allValid = this.batterySettingsForms.every(form => form.formGroup.valid);
    if (!allValid) {
      this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.ENTER_VALID_ADDRESS"), "warning");
      return;
    }

    this.batterySettingsForms.forEach((form, index) => {
      this.numberOfTowersPerBattery[index] = form.model.numberOfTowers;
      this.numberOfModulesPerTowerPerBattery[index] = form.model.numberOfModulesPerTower;
    });

    this.setIsWaiting(true);
    this.initializeAllFields().then(() => this.setIsWaiting(false));
  }

  public extractSerialNumbers(fields: FormlyFieldConfig[]): ComponentData[] {
    const serialNumbers: ComponentData[] = [];
    this.duplicateSerialNumbers = [];

    for (const field of fields) {
      const label = field.props.label;
      const value = (field.props.prefix ?? "") + field.formControl.value;

      serialNumbers.push({
        label: label,
        value: value,
      });
    }

    // check if there are duplicates and add it to duplicates array to display later in alert.
    // Collect the duplicate values..
    const duplicateValues = serialNumbers
      .map(v => v.value)
      .filter((v, i, valueArray) => valueArray.indexOf(v) !== i);

    // Based on the Id's collect the Labels to display in the alert.
    serialNumbers.filter(obj => duplicateValues.includes(obj.value))
      .forEach((value) => this.duplicateSerialNumbers.push(value.label));

    return serialNumbers;
  }

}
