// @ts-strict-ignore
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { SetupProtocol } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { Edge, EdgeConfig, Service, Websocket } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { environment } from "src/environments";
import { Category } from "../shared/category";
import { CommercialCluster, FeedInType, View, WebLinks } from "../shared/enums";
import { ComponentData, EmsType, TableData } from "../shared/ibndatatypes";
import { Meter } from "../shared/meter";
import { System, SystemId, SystemType } from "../shared/system";
import { ComponentConfigurator } from "../views/configuration-execute/component-configurator";

export type SerialNumberData = {
  formGroup: FormGroup;
  fieldSettings: FormlyFieldConfig[];
  model: any;
  header: string;
};

export type SchedulerId = {
  componentId: string,
  behaviour: SchedulerIdBehaviour
};

export enum SchedulerIdBehaviour {
  MANAGED_BY_APP_MANAGER,
  ALWAYS_INCLUDE,
}

export abstract class AbstractIbn {
  //Regex code for validating Countries.
  public static readonly COUNTRY_PARTNER_ZIP_CODE_REGEX: RegExp = /^((\d{5}(-\d{4})?)|([1-9]\d{3}\s?[A-Z]{2})|(\d{3}\s?\d{2})|(\d{4}))$/;

  // Battery type
  public readonly systemType: SystemType;

  // Id
  public readonly systemId: SystemId;

  // protocol-installer
  public installer?: {
    companyName: string;
    lastName: string;
    firstName: string;
    street: string;
    zip: string;
    city: string;
    country: Country;
    email: string;
    phone: string;
  };

  // protocol-customer
  public customer?: {
    isCorporateClient: boolean;
    companyName: string;
    lastName: string;
    firstName: string;
    street: string;
    zip: string;
    city: string;
    country: Country;
    email: string;
    emailConfirm: string;
    phone: string;
  };

  // protocol-system
  public location?: {
    isEqualToCustomerData: boolean;
    isCorporateClient: boolean;
    companyName: string;
    lastName: string;
    firstName: string;
    street: string;
    zip: string;
    city: string;
    country: Country;
    email?: string;
    phone?: string;
  };

  // configuration-line-side-meter-fuse
  public lineSideMeterFuse?: {
    category: Category;
    fixedValue?: number;
    otherValue?: number;
    meterType?: Meter.GridMeter;
  };

  // protocol-dynamic-feed-in-limitation
  public feedInLimitation?: {
    feedInType: FeedInType,
    maximumFeedInPower?: number;
  };

  // configuration-emergency-reserve
  public emergencyReserve?: {
    isEnabled: boolean;
    isReserveSocEnabled: boolean;
    minValue: number;
    value: number;
  };

  // Protocol Serial Numbers.
  public serialNumbers: {
    numberOfTowers: number[],
    numberOfModulesPerTower: number[],
    batteriesData?: {
      label: string,
      modules: ComponentData[];
    }[],
    doubleSocket?: {
      isEnabled: boolean[][];
      label?: string;
    },
    formModels?: any[],
  };

  // Configuration summary
  public gtcAndWarrantyLinks: {
    gtcLink: WebLinks;
    warrantyLink: WebLinks;
  };

  //Controller-Id's
  public requiredControllerIds: SchedulerId[];

  // Configuration-summary
  public setupProtocol?: SetupProtocol;

  // Protocol-serial-numbers
  public setupProtocolId?: string;

  // Rundsteuerempfaenger manual in feed in limitation
  public readonly showRundSteuerManual: boolean;

  // Show view count along with Schritt number on top of page.
  public showViewCount: boolean;

  // Contains default number of battery modules per tower based on system.
  public readonly defaultNumberOfModules: number;

  // Label used for device check in configuration summary. It is different for Industrial systems.
  public readonly isDevicesActiveCheckedLabel: string = this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.DEVICE_ACTIVE_CHECKED");

  // Limit value changes for home and commercial.
  public readonly maxFeedInLimit: number = 29999;

  // Delay for function tests
  public WAIT_FOR_BATTERY_SERIAL_NUMBERS: number = 120000;

  // Seperate notes to warn installers to perform timely inverter (KACO) checks. applies for comemrcial-92.
  public readonly showNote: boolean = false;

  // deafault values for 14a view.
  public isController14aActivated: boolean = true;

  // Index of the 14a controller view.
  public readonly indexOf14aLimiterControllerView: number = 7;

  public abstract readonly isDoubleSocketValid: boolean | null;

  constructor(public views: View[], public translate: TranslateService) { }

  /**
 * sets the Feed-In-Limit fields from the model.
 *
 * @param model the model containing the user input for the Dynamic-Feed-In-Limit fields.
 */
  public setFeedInLimitFields(model: any) { }

  /**
   * Returns the fields that has sub systems specific to the 'System Type' selected in previous step.
   */
  public getSubSystemFields(): FormlyFieldConfig[] {
    return [];
  }

  /**
   * View Emergency-reserve
   * Adds and returns the specific battery information based on Ibn to view in summary.
   *
   */
  public addCustomBatteryData(): ComponentData[] {
    const batteryData: ComponentData[] = [];
    if (this.emergencyReserve) {
      batteryData.push({
        label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.IS_ACTIVATED"),
        value: this.emergencyReserve.isEnabled ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
      });

      if (this.emergencyReserve.isEnabled) {
        batteryData.push({
          label: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.EMERGENCY_RESERVE_VALUE"),
          value: this.emergencyReserve.value,
        });
      }
    }
    batteryData.push({ label: this.translate.instant("Index.TYPE"), value: this.systemType });
    return batteryData;
  }

  /**
   * Sets the Non abstract fields for the IBN object from session storage or from specific views.
   *
   * for eg: commercial 50 features, modbus bridge type from commercial systems and many more.
   *
   * @param model model information from the view.
   */
  public setNonAbstractFields(model: any) { }

  /**
   * Gets the additional Emergency reserve fields.
   *
   * eg: Coupler fields from Commercial 30 Netztrenstelle variant.
   *
   * @param fields fields for the componenet.
   * @returns The fields to be displayed.
   */
  public getAdditionalEmergencyReserveFields(fields: FormlyFieldConfig[]): FormlyFieldConfig[] {
    return fields;
  }

  /**
   * Adds the emergency reserve model to the IBN.
   *
   * @param model The model.
   */
  public setEmergencyReserve(model: any) {
    this.emergencyReserve = model;
  }

  /**
   * Returns the common fields for all systems in Feed in limitation view.
   *
   * @param totalPvPower The total pv power configured.
   * @returns common fields for feed in limits fields.
   */
  public getCommonFeedInLimitsFields(totalPvPower: number): FormlyFieldConfig[] {
    const fields: FormlyFieldConfig[] = [];

    fields.push({
      key: "feedInType",
      type: "select",
      className: "white-space-initial",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CHOOSE"),
        placeholder: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.PLACE_HOLDER"),
        options: this.getFeedInTypeOptions(),
        required: true,
      },
    });

    fields.push({
      key: "maximumFeedInPower",
      type: "input",
      templateOptions: {
        type: "number",
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_FEED_IN_VALUE"),
        description: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_VALUE_DESCRIPTION"),
        required: true,
        max: this.maxFeedInLimit,
      },
      parsers: [Number],
      defaultValue: totalPvPower,
      hideExpression: model =>
        model.feedInType !== FeedInType.DYNAMIC_LIMITATION &&
        model.feedInType !== FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION,

      expressionProperties: {
        "templateOptions.label": (model: any) => {
          if (model.feedInType === FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION) {
            return this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_FEED_IN_VALUE_DYNAMIC_AND_EXTERNAL_LIMITATION");
          }

          return this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_FEED_IN_VALUE");
        },
      },
    });

    return fields;
  }

  /**
   * Retrieves the fields for View Line side meter Fuse,
   * which are different for Home and Commercial systems.
   */
  public getLineSideMeterFuseFields(): FormlyFieldConfig[] {
    const fields: FormlyFieldConfig[] = [];

    fields.push({
      key: "fixedValue",
      type: "select",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.VALUE"),
        description: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.FIXED_VALUE_DESCRIPTION"),
        options: [
          { label: "25 A", value: 25 },
          { label: "32 A", value: 32 },
          { label: "35 A", value: 35 },
          { label: "40 A", value: 40 },
          { label: "50 A", value: 50 },
          { label: "63 A", value: 63 },
          { label: "80 A", value: 80 },
          { label: "100 A", value: 100 },
          { label: "120 A", value: 120 },
          { label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.OTHER"), value: -1 },
        ],
        required: true,
      },
      parsers: [Number],
    });

    fields.push({
      key: "otherValue",
      type: "input",
      templateOptions: {
        type: "number",
        label: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.OTHER_VALUE"),
        min: 0,
        required: true,
      },
      parsers: [Number],
      validators: {
        validation: ["onlyPositiveInteger"],
      },
      hideExpression: model => model.fixedValue !== -1,
    });
    return fields;
  }

  /**
   * Returns Setup Protocol with common objects for all systems.
   *
   * @param edge The current Edge object
   * @returns new SetupProtocol with objects added.
   */
  public getCommonProtocolItems(edge: Edge): SetupProtocol {
    const installer = this.installer;
    const customer = this.customer;
    const lineSideMeterFuse = this.lineSideMeterFuse;

    const installerObj: any = {
      firstname: installer.firstName,
      lastname: installer.lastName,
    };

    const customerObj: any = {
      firstname: customer.firstName,
      lastname: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: {
        street: customer.street,
        city: customer.city,
        zip: customer.zip,
        country: customer.country,
      },
    };

    if (customer.isCorporateClient) {
      customerObj.company = {
        name: customer.companyName,
      };
    }

    const protocol: SetupProtocol = {
      fems: {
        id: edge.id,
      },
      installer: installerObj,
      customer: customerObj,
      oem: environment.theme,
    };

    // If location data is different to customer data, the location
    // data gets sent too
    if (!this.location.isEqualToCustomerData) {
      const location = this.location;
      protocol.location = {
        firstname: location.firstName,
        lastname: location.lastName,
        email: location.email,
        phone: location.phone,
        address: {
          street: location.street,
          city: location.city,
          zip: location.zip,
          country: location.country,
        },
        company: {
          name: location.companyName,
        },
      };
    }

    protocol.items = [];

    const feedInLimitation = this.feedInLimitation;
    const isDynamicFeedInLimitation = feedInLimitation.feedInType == FeedInType.DYNAMIC_LIMITATION ||
      feedInLimitation.feedInType == FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION;
    const isExternalLimitation = feedInLimitation.feedInType == FeedInType.DYNAMIC_LIMITATION ||
      feedInLimitation.feedInType == FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION;

    protocol.items.push(
      {
        category: Category.FEED_IN_MANAGEMENT,
        name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.EXTERNAL_CONTROLLER_RECEIVER"),
        value: isExternalLimitation ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
      },
      {
        category: Category.FEED_IN_MANAGEMENT,
        name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION"),
        value: isDynamicFeedInLimitation ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
      },
      {
        category: Category.FEED_IN_MANAGEMENT,
        name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NO_LIMITATION"),

        value: feedInLimitation.feedInType == FeedInType.NO_LIMITATION
          ? this.translate.instant("General.yes")
          : this.translate.instant("General.no"),
      });

    if (isDynamicFeedInLimitation) {
      protocol.items.push({
        category: Category.FEED_IN_MANAGEMENT,
        name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_FEED_IN_VALUE"),
        value: feedInLimitation.maximumFeedInPower
          ? feedInLimitation.maximumFeedInPower.toString()
          : (0).toString(),
      });
    }

    if (lineSideMeterFuse) {

      if (lineSideMeterFuse.category !== Category.LINE_SIDE_METER_FUSE_HOME && lineSideMeterFuse.meterType) {
        protocol.items.push({
          category: lineSideMeterFuse.category,
          name: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.METER"),
          value: lineSideMeterFuse.meterType,
        });
      }

      const lineSideMeterFuseValue = lineSideMeterFuse.otherValue ?? lineSideMeterFuse.fixedValue;

      protocol.items.push({
        category: this.lineSideMeterFuse.category,
        name: this.translate.instant("INSTALLATION.CONFIGURATION_LINE_SIDE_METER_FUSE.VALUE"),
        value: lineSideMeterFuseValue ? lineSideMeterFuseValue.toString() : "",
      });
    }

    protocol.items.push({
      category: Category.EMS_DETAILS,
      name: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.EDGE_NUMBER", { edgeShortName: environment.edgeShortName }),
      value: edge.id,
    });

    // Speichersystemkomponenten
    const doubleSocketLabel: string = this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.DOUBLE_SOCKET");

    protocol.lots = this.serialNumbers.batteriesData.flatMap(batteryData =>
      batteryData.modules.map(module => {
        // Default name and value
        let name = this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.SINGLE_SERIAL_NUMBER", { label: module.label });
        let value = module.value;

        // Special condition for the double socket
        if (this.isDoubleSocketValid && module.label === doubleSocketLabel) {
          name = doubleSocketLabel;
          value = module.value ? this.translate.instant("General.yes") : this.translate.instant("General.no");
        }

        return {
          category: batteryData.label,
          name: name,
          serialNumber: value,
        };
      })
    );

    return protocol;
  }

  /**
   * Returns the ems type saved in Odoo.
   *
   * @returns the EMS type or null if it is empty.
   */
  public getEmsType(): EmsType {

    // Retrieve emsType and handle the "null" string case safely
    const rawEmsType: string = sessionStorage.getItem("emsType");

    // Check if the raw value is the string "null" and convert it to the correct type
    return (rawEmsType === "null" ? null : rawEmsType) as EmsType;

  }

  /**
   * Loads the appropriate Ibn object.
   *
   */
  public setIbn(system: any): AbstractIbn {
    return System.getSystemObjectFromSystemId(system, this.translate);
  }

  /**
   * Updates the `views` array by removing or adding specific views.
   *
   * Manages the presense of the `PreInstallationUpdate` based on the Edge version for all systems.
   * Manages the presence of the `ConfigurationEssLimiter14aComponent` view based on country location, for both Home and Commercial systems.
   * Manages the presence of the `ConfigurationGridSettingComponent` view based on country location, for Commercial systems.
   *
   * @param edge the current edge.
   */
  public removeOrAddView(edge: Edge): void {
    // TODO remove when every edge starts with at least the required version
    // only show update view if the update requests are implemented
    if (!edge) {
      return;
    }

    // Removes the view if the version is not at least '2021.19.1'.
    if (!edge.isVersionAtLeast("2021.19.1")) {
      const indexOfUpdate = this.views.indexOf(View.PreInstallationUpdate);
      if (indexOfUpdate != -1) {
        this.views.splice(indexOfUpdate, 1);
      }
    }
  }

  /**
   * Manages the presence of the ConfigurationEssLimiter14aComponent view based on country location.
   *
   * @remarks
   * Performs two main operations:
   * 1. Removes the ConfigurationEssLimiter14aComponent view and deactivates the controller flag when the location is not Germany
   * 2. Re-adds the ConfigurationEssLimiter14aComponent view (if missing) and activates the controller flag when the location is Germany,
   * handling accidental country selection rollbacks
   *
   */
  public removeOrAddEssLimiter14aView(): void {

    const location: Country = this.location?.isEqualToCustomerData ? this.customer.country : this.location?.country;
    const indexOfView: number = this.views.indexOf(View.ConfigurationEssLimiter14aComponent);

    if (location && location !== Country.GERMANY) {
      const indexOfUpdate: number = indexOfView;
      if (indexOfUpdate != -1) {
        // Remove ConfigurationEssLimiter14aComponent.
        this.views.splice(indexOfUpdate, 1);
        this.isController14aActivated = false;
      }
      return;
    }

    if (indexOfView === -1) {
      // Add ConfigurationEssLimiter14aComponent.
      // This is valid only when installer accidentally selects a wrong country and comes back changes it to "Germany".
      this.views.splice(this.indexOf14aLimiterControllerView, 0, View.ConfigurationEssLimiter14aComponent);
      this.isController14aActivated = true;
    }
  }

  /**
   * Restricts the reading of serial numbers to specific towers configured.
   */
  public readSerialNumbersFromRegisters(edge: Edge, websocket: Websocket, numberOfTowers: number, numberOfModulesPerTower: number, index?: number): Promise<{}>[] {

    const result: Promise<{}>[] = [];
    for (let tower = 0; tower < numberOfTowers; tower++) {
      result.push(this.getSerialNumbersFromEdge(tower, edge, websocket, numberOfModulesPerTower));
    }

    return result;
  }

  /**
   * Gets the list of options that should be displayed in feedInLimitation view.
   *
   * @returns The options.
   */
  public getFeedInTypeOptions(): ComponentData[] {
    return [
      { label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION_WITH_RIPPLE_CONTROLLER"), value: FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION },
      { label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.DYNAMIC_LIMITATION"), value: FeedInType.DYNAMIC_LIMITATION },
      { label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.EXTERNAL_LIMITATION"), value: FeedInType.EXTERNAL_LIMITATION },
      { label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NO_LIMITATION"), value: FeedInType.NO_LIMITATION },
    ];
  }

  /**
   * Adds all fields which are System specific to be displayed in Configuration-Summary View.
   *
   * @param tableData The table data whose fields are displayed in Configuration-Summary.
   */
  public abstract addSystemSpecificFields(tableData: TableData[]): void;

  /**
 * Returns the number of towers and modules per tower.
 *
 * @param edge the current edge.
 * @param websocket the Websocket connection.
 */
  public abstract getPreSettingInformationFromEdge(edge: Edge, websocket: Websocket): Promise<Array<{ numberOfTowers: number; numberOfModulesPerTower: number }>>;

  /**
   * Returns the component fields for serial numbers based on system being installed.
   *
   * @param towerNr number of towers.
   * @param numberOfModulesPerTower number of modules per tower.
   * @param batteryIndex index of the battery/slave from the list of batteries (Comemrcial cluster). usually '0' for Home.
   */
  public abstract getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number, batteryIndex?: number): FormlyFieldConfig[];

  /**
   * Returns the fields to enter number of towers and modules, manually.
   *
   * @param numberOfModulesPerTower number of modules per tower.
   * @param numberOfTowers number of towers.
   */
  public abstract getPreSettingsFields(numberOfModulesPerTower: number, numberOfTowers: number): FormlyFieldConfig[];

  /**
   * Returns the appropriate header for serial number category for the system.
   * @param towerIndex the index of the towers.
   * @param batteryIndex the index of the batteries. usually '0' for Home.
   */
  public abstract getSerialNumberCategoryHeader(towerIndex: number, batteryIndex?: number): string;

  /**
   * Retrieves the Serial numbers of the battery modules and components.
   *
   * @param towerNr number of towers.
   * @param edge the current edge.
   * @param websocket the Websocket connection.
   * @param numberOfModulesPerTower number of modules per tower.
   * @paramm slaveNr index of the slave from list of slaves in the commercial cluster.
   */
  public abstract getSerialNumbersFromEdge(towerNr: number, edge: Edge, websocket: Websocket, numberOfModulesPerTower?: number, slaveNr?: number): Promise<{}>;

  /**
   * View Configuration Dynamic Feed-In limitation.
   * Returns the fields for the views based on the system.
   */
  public abstract getFeedInLimitFields(): FormlyFieldConfig[];

  /**
   * View Configuration-execute.
   * Returns the required configuration object with components specific to the system.
   *
   * @param edge the current edge.
   * @param config the EdgeConfig.
   * @param websocket the Websocket connection.
   * @param service the Service.
   */
  public abstract getComponentConfigurator(
    edge: Edge,
    config: EdgeConfig,
    websocket: Websocket,
    service?: Service,
    cluster?: CommercialCluster,
  ): Promise<ComponentConfigurator>;

  /**
   * View Protocol-serial-numbers.
   * Returns the Protocol information of the system.
   *
   * @param edge the current edge.
   * @param websocket the Websocket connection.
   */
  public abstract getProtocol(edge: Edge, websocket: Websocket): Promise<string>;

  /**
   * Returns the set of controller for updateScheduler in component configurator.
   */
  public abstract setRequiredControllers();

  /**
   * Returns the fields that has system variants specific to the 'System Type' selected in previous step.
   */
  public abstract getSystemVariantFields(): FormlyFieldConfig[];
}
