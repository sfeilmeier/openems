// @ts-strict-ignore
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { filter, takeUntil } from "rxjs/operators";
import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { SetupProtocol, SubmitSetupProtocolRequest } from "src/app/shared/jsonrpc/request/submitSetupProtocolRequest";
import { ChannelAddress, Edge, EdgeConfig, Service, Websocket } from "src/app/shared/shared";

import { AppCenterUtil } from "../../shared/appcenterutil";
import { Category } from "../../shared/category";
import { FeedInSetting, FeedInType, View, WebLinks } from "../../shared/enums";
import { IbnUtils } from "../../shared/ibn.utils";
import { ComponentData, DcPv, EmsType } from "../../shared/ibndatatypes";
import { Meter } from "../../shared/meter";
import { FEED_IN_POWER_FACTOR_OPTIONS } from "../../shared/options";
import { SystemId, SystemType } from "../../shared/system";
import { BaseMode, ComponentConfigurator, ConfigurationMode, ConfigurationObject } from "../../views/configuration-execute/component-configurator";
import { GetEstimatedConfigRequest } from "../../views/configuration-execute/jsonrpc/getEstimatedConfig";
import { GetEstimatedConfigResponse } from "../../views/configuration-execute/jsonrpc/getEstimatedConfigResponse";
import { SafetyCountry } from "../../views/configuration-execute/safety-country";
import { AbstractIbn, SchedulerIdBehaviour } from "../abstract-ibn";

export type HomeAdditionalApp = {
  FEED_IN_TYPE: FeedInType,
  GRID_METER_CATEGORY: Meter.GridMeterCategory,
  CT_RATIO_FIRST: number,
};

export type HomeCommonApp = {
  SAFETY_COUNTRY: SafetyCountry,
  FEED_IN_SETTING: string,
  MAX_FEED_IN_POWER?: number,
  HAS_EMERGENCY_RESERVE: boolean,
  EMERGENCY_RESERVE_ENABLED?: boolean,
  EMERGENCY_RESERVE_SOC?: number,
  SHADOW_MANAGEMENT_DISABLED?: boolean,
  HAS_ESS_LIMITER_14A: boolean,
  NA_PROTECTION_ENABLED: boolean,
};

export abstract class AbstractHomeIbn extends AbstractIbn {
  public static readonly BASE_IMAGE_PATH = "assets/img/home-mppt/";
  private static readonly SELECTOR = "Home";
  private static readonly MODULE_DATA_TIMEOUT = 12_000; // two minutes
  private static readonly TOWER_DATA_TIMEOUT = 5_000; // five seconds

  public override readonly systemType: SystemType = SystemType.FENECON_HOME;
  public override readonly isDoubleSocketValid: boolean = true;

  // Protocol-pv-component
  public batteryInverter?: {
    shadowManagementDisabled?: boolean;
  };

  // configuration-emergency-reserve
  public override emergencyReserve? = {
    isEnabled: true,
    minValue: 5,
    value: 20,
    isReserveSocEnabled: false,
  };

  // protocol-dynamic-feed-in-limitation
  public override feedInLimitation?: {
    feedInType: FeedInType,
    maximumFeedInPower?: number;
    naProtection: boolean;
    feedInSetting?: FeedInSetting;
    fixedPowerFactor?: FeedInSetting;
    isManualProperlyFollowedAndRead?: boolean;
  } = {
      feedInType: FeedInType.NO_LIMITATION,
      maximumFeedInPower: 0,
      naProtection: false,
      feedInSetting: FeedInSetting.FixedPowerFactor,
      fixedPowerFactor: FeedInSetting.Leading_1,
      isManualProperlyFollowedAndRead: false,
    };

  // protocol-pv
  public pv?: {
    dc?: DcPv[];
  };

  public estimatedConfig: GetEstimatedConfigResponse = null;

  // Protocol line side meter fuse
  public override lineSideMeterFuse?: {
    category: Category;
    fixedValue?: number;
    otherValue?: number;
  } = {
      category: Category.LINE_SIDE_METER_FUSE_HOME,
    };

  //Configuration Summary
  public override gtcAndWarrantyLinks: {
    gtcLink: WebLinks;
    warrantyLink: WebLinks;
  } = {
      gtcLink: WebLinks.GTC_LINK,
      warrantyLink: WebLinks.WARRANTY_LINK_HOME,
    };

  // configuration Energu Flow Meter
  public energyFlowMeter: {
    meter: Meter.GridMeterCategory;
    value?: number;
  };

  // protocol avu box
  public avu: {
    isIncluded: boolean;
    serialNumber?: string;
  };

  public readonly imageUrl: string = "assets/img/Home-Typenschild-web.jpg";
  public readonly relayFactoryId: string = "IO.KMtronic.4Port"; // Default 'Home10' factoryId.
  public override readonly showRundSteuerManual: boolean = true;
  public override showViewCount: boolean = false;
  public override readonly defaultNumberOfModules: number = 5;

  private numberOfModulesPerTower: number;
  public abstract mppt: any;

  public abstract readonly emsBoxLabel: Category;
  public abstract readonly maxNumberOfPvStrings: number;
  public abstract readonly maxNumberOfMppt: number;
  public abstract readonly homeAppId: string;
  public abstract readonly homeAppAlias: string;
  public abstract readonly maxNumberOfTowers: number;
  public abstract readonly maxNumberOfModulesPerTower: number;
  public abstract readonly minNumberOfModulesPerTower: number;
  public abstract readonly defaultEnergyFlowMeter: Meter.GridMeterCategory;

  constructor(public override views: View[], public override translate: TranslateService) {
    super(views, translate);
  }

  public override getSerialNumberCategoryHeader(towerIndex: number): string {
    return towerIndex === 0
      ? this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BESS_COMPONENTS")
      : this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_TOWER", { number: towerIndex });
  }

  public override getPreSettingsFields(numberOfModulesPerTower: number, numberOfTowers: number) {
    const fields: FormlyFieldConfig[] = [];

    fields.push({
      key: "numberOfTowers",
      type: "input",
      templateOptions: {
        type: "number",
        label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.NUMBER_OF_TOWERS"),
        min: 1,
        max: this.maxNumberOfTowers,
        required: true,
      },
      parsers: [Number],
      defaultValue: numberOfTowers,
    });

    fields.push({
      key: "numberOfModulesPerTower",
      type: "input",
      templateOptions: {
        type: "number",
        label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.NUMBER_OF_MODULES_PER_TOWER"),
        min: this.minNumberOfModulesPerTower,
        max: this.maxNumberOfModulesPerTower,
        required: true,
      },
      parsers: [Number],
      defaultValue: numberOfModulesPerTower,
    });

    return fields;
  }

  public override getSerialNumberFields(towerNr: number, numberOfModulesPerTower: number, batteryIndex: number) {
    const fields: FormlyFieldConfig[] = [];
    const emsBoxSerialNumber: string = sessionStorage.getItem("emsBoxSerialNumber");

    switch (towerNr) {
      case 0:
        fields.push({
          key: "batteryInverter",
          type: "input",
          templateOptions: {
            label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.INVERTER"),
            required: true,
            placeholder: "xxxxxxxxxxxxxxxx",
          },
          validators: {
            validation: ["batteryInverterSerialNumber"],
          },
          wrappers: ["input-serial-number"],
        });
        fields.push({
          key: "emsBox",
          type: "input",
          templateOptions: {
            label: Category.toTranslatedString(this.emsBoxLabel, this.translate),
            required: true,
            placeholder: "xxxxxxxxxx",
          },
          defaultValue: emsBoxSerialNumber,
          validators: {
            validation: ["emsBoxSerialNumber"],
          },
          wrappers: ["input-serial-number"],
        });
        break;
      case 1:
        fields.push({
          key: "parallelBox",
          type: "input",
          templateOptions: {
            label: "Parallel Box",
            required: true,
            prefix: "FHP",
            placeholder: "xxxxxxxxx",
          },
          validators: {
            validation: ["boxSerialNumber"],
          },
          wrappers: ["input-serial-number"],
        });
        break;
      default: // usually 2,3,4,5
        fields.push({
          key: "extensionBox",
          type: "input",
          templateOptions: {
            label: "Extension Box",
            required: true,
            prefix: "FHE",
            placeholder: "xxxxxxxxx",
          },
          validators: {
            validation: ["boxSerialNumber"],
          },
          wrappers: ["input-serial-number"],
        });
        break;
    }

    fields.push({
      key: "bmsBox",
      type: "input",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BMS_BOX"),
        required: true,
        placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",
        ...(this.isDoubleSocketValid && {
          checkbox: {
            value: this.serialNumbers?.doubleSocket?.isEnabled?.[batteryIndex]?.[towerNr] ?? false,
            label: this.serialNumbers?.doubleSocket?.label,

            updateFn: (checked: boolean) => {
              if (this.serialNumbers?.doubleSocket?.isEnabled?.[batteryIndex]) {
                this.serialNumbers.doubleSocket.isEnabled[batteryIndex][towerNr] = checked;
              }
            },
          },
        }),
      },
      validators: {
        validation: ["batteryAndBmsBoxSerialNumber"],
      },
      wrappers: ["input-serial-number"],
    });

    for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
      fields.push({
        key: "module" + moduleNr,
        type: "input",
        templateOptions: {
          label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.BATTERY_MODULE") + (moduleNr + 1),
          required: true,
          placeholder: "xxxxxxxxxxxxxxxxxxxxxxxx",
        },
        validators: {
          validation: ["batteryAndBmsBoxSerialNumber"],
        },
        wrappers: ["input-serial-number"],
      });
    }

    return fields;
  }

  public override getSerialNumbersFromEdge(towerNr: number, edge: Edge, websocket: Websocket, numberOfModulesPerTower: number) {
    return new Promise((resolve) => {
      let isResolved = false;
      const channelAddresses: { [key: string]: ChannelAddress } = {};
      const subscriptionId = AbstractHomeIbn.SELECTOR + "-tower" + towerNr;
      const model: {} = {};

      // Gather channel addresses
      channelAddresses["batteryInverter"] = new ChannelAddress("batteryInverter0", "SerialNumber");
      channelAddresses["bmsBox"] = new ChannelAddress("battery0", "Tower" + towerNr + "BmsSerialNumber");

      for (let moduleNr = 0; moduleNr < numberOfModulesPerTower; moduleNr++) {
        channelAddresses["module" + moduleNr] = new ChannelAddress("battery0", "Tower" + towerNr + "Module" + moduleNr + "SerialNumber");
      }

      // Edge-subscribe
      edge.subscribeChannels(websocket, subscriptionId, Object.values(channelAddresses));

      // Subject to stop the subscription to currentData
      const stopOnRequest: Subject<void> = new Subject<void>();

      // Read data
      edge.currentData.pipe(
        takeUntil(stopOnRequest),
        filter(currentData => currentData != null),
      ).subscribe((currentData) => {
        let anyNullOrUndefined: boolean = false;
        for (const key in channelAddresses) {
          if (key in channelAddresses) {
            const channelAddress: ChannelAddress = channelAddresses[key];
            const serialNumber: string = currentData.channel[channelAddress.componentId + "/" + channelAddress.channelId];

            // If one serial number is undefined return
            if (!serialNumber) {
              anyNullOrUndefined = true;
              continue;
            }

            // Add serial Number
            model[key] = serialNumber;
          }
        }

        if (!anyNullOrUndefined) {
          // Resolve the promise
          isResolved = true;
          resolve(model);
        }
      });
      setTimeout(() => {
        // If data isn't available after the timeout, the
        // promise gets resolved with an empty/partially filled object
        if (!isResolved) {
          resolve(model);
        }

        // Unsubscribe to currentData and channels after timeout
        stopOnRequest.next();
        stopOnRequest.complete();
        edge.unsubscribeChannels(websocket, subscriptionId);
      }, AbstractHomeIbn.MODULE_DATA_TIMEOUT);

    });
  }

  public override getPreSettingInformationFromEdge(edge: Edge, websocket: Websocket): Promise<[{ numberOfTowers: number, numberOfModulesPerTower: number }]> {
    return new Promise((resolve) => {
      let isResolved = false;

      // Edge-subscribe
      edge.subscribeChannels(websocket, "", [
        new ChannelAddress("battery0", "NumberOfTowers"),
        new ChannelAddress("battery0", "NumberOfModulesPerTower"),
      ]);

      // Subject to stop the subscription to currentData
      const stopOnRequest: Subject<void> = new Subject<void>();

      // Read tower and module numbers
      edge.currentData.pipe(
        takeUntil(stopOnRequest),
        filter(currentData => currentData != null),
      ).subscribe((currentData) => {
        const numberOfTowers = currentData.channel["battery0/NumberOfTowers"];
        const numberOfModulesPerTower = currentData.channel["battery0/NumberOfModulesPerTower"];

        // If values are available, resolve the promise with them
        if (numberOfTowers && numberOfModulesPerTower) {
          isResolved = true;
          // 10 is given as radix parameter.
          // 2 = binary, 8 = octal, 10 = decimal, 16 = hexadecimal.
          resolve([{ numberOfTowers: parseInt(numberOfTowers, 10), numberOfModulesPerTower: parseInt(numberOfModulesPerTower, 10) }]);
        }
      });

      setTimeout(() => {
        // If data isn't available after the timeout, the
        // promise gets resolved with default values
        if (!isResolved) {
          resolve([{ numberOfTowers: 1, numberOfModulesPerTower: this.minNumberOfModulesPerTower }]);
        }

        // Unsubscribe to currentData and channels after timeout
        stopOnRequest.next();
        stopOnRequest.complete();
        edge.unsubscribeChannels(websocket, "home");
      }, AbstractHomeIbn.TOWER_DATA_TIMEOUT);
    });
  }

  public getFeedInLimitFields() {

    const pv: {
      dc?: DcPv[];
    } = this.pv;

    let totalPvPower: number = 0;
    for (const dc of pv.dc) {
      totalPvPower += (dc.isSelected ? Number.parseInt(dc.value.toString()) : 0);
    }

    // maximum limit for feed in power is 25000.
    totalPvPower = Math.min(totalPvPower, this.maxFeedInLimit);

    // Update the feedInlimitation field
    this.feedInLimitation.maximumFeedInPower = totalPvPower;
    this.feedInLimitation.isManualProperlyFollowedAndRead = this.feedInLimitation.isManualProperlyFollowedAndRead ? this.feedInLimitation.isManualProperlyFollowedAndRead : null;

    const fields: FormlyFieldConfig[] = super.getCommonFeedInLimitsFields(totalPvPower);

    fields.push({
      key: "naProtection",
      type: "checkbox",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NA_PROTECTION"),
      },
    });

    fields.push({
      key: "feedInSetting",
      type: "radio",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CHOOSE"),
        description: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.FEED_IN_SETTING_DESCRIPTION"),
        options: [
          { label: FeedInSetting.getFeedInSettingLabel(FeedInSetting.QuEnableCurve, this.translate), value: FeedInSetting.QuEnableCurve },
          { label: FeedInSetting.getFeedInSettingLabel(FeedInSetting.PuEnableCurve, this.translate), value: FeedInSetting.PuEnableCurve },
          { label: FeedInSetting.getFeedInSettingLabel(FeedInSetting.FixedPowerFactor, this.translate), value: FeedInSetting.FixedPowerFactor }],
        required: true,
      },
    });

    fields.push({
      key: "fixedPowerFactor",
      type: "select",
      templateOptions: {
        description: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.FIXED_POWER_FACTOR_DESCRIPTION"),
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CONSTANT_VALUE"),
        options: FEED_IN_POWER_FACTOR_OPTIONS(),
        required: true,
      },
      defaultValue: FeedInSetting.Leading_1,
      hideExpression: model => model.feedInSetting !== FeedInSetting.FixedPowerFactor,
    });

    fields.push({
      key: "isManualProperlyFollowedAndRead",
      type: "checkbox",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.EXTERNAL_CONTROLLER_CHECK"),
        required: true,
      },
      hideExpression: model => model.feedInType != FeedInType.EXTERNAL_LIMITATION,
    });

    return fields;
  }

  public override setFeedInLimitFields(model: any) {

    this.feedInLimitation.feedInType = model.feedInType;
    this.feedInLimitation.feedInSetting = model.feedInSetting ?? FeedInSetting.Undefined;
    this.feedInLimitation.fixedPowerFactor = model.fixedPowerFactor ?? FeedInSetting.Undefined;
    this.feedInLimitation.isManualProperlyFollowedAndRead = model.isManualProperlyFollowedAndRead;
  }

  public override setRequiredControllers() {
    this.requiredControllerIds = [];
    if (this.emergencyReserve.isEnabled) {
      this.requiredControllerIds.push({
        componentId: "ctrlEmergencyCapacityReserve0",
        behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
      });
    }

    if (this.isController14aActivated) {
      this.requiredControllerIds.push(
        {
          componentId: "ctrlEssLimiter14a0",
          behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
        },
      );
    }

    this.requiredControllerIds.push(
      {
        componentId: "ctrlGridOptimizedCharge0",
        behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
      },
      {
        componentId: "ctrlEssSurplusFeedToGrid0",
        behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
      },
      {
        componentId: "ctrlBalancing0",
        behaviour: SchedulerIdBehaviour.MANAGED_BY_APP_MANAGER,
      },
    );
  }

  public override addSystemSpecificFields(tableData): void {
    const batteryData: ComponentData[] = this.addCustomBatteryData();

    tableData.push({
      header: Category.BATTERY,
      rows: batteryData,
    });

    const batteryInverterData: ComponentData[] = [];
    const isDynamicFeedInLimitation = this.feedInLimitation.feedInType == FeedInType.DYNAMIC_LIMITATION ||
      this.feedInLimitation.feedInType == FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION;

    if (isDynamicFeedInLimitation) {
      batteryInverterData.push(
        {
          label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.MAXIMUM_FEED_IN_VALUE"),
          value: this.feedInLimitation.maximumFeedInPower,
        },
        {
          label: this.translate.instant("INSTALLATION.PROTOCOL_PV.SHADE_MANAGEMENT_DEACTIVATE"),
          value: this.batteryInverter?.shadowManagementDisabled ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
        }
      );
    } else {
      batteryInverterData.push(
        {
          label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.SHADE_MANAGEMENT_DEACTIVATED"),
          value: this.translate.instant("General.yes"),
        },
      );
    }

    batteryInverterData.push({
      label: this.translate.instant("Index.TYPE"),
      value: FeedInSetting.getFeedInSettingLabel(this.feedInLimitation.feedInSetting, this.translate) ?? FeedInSetting.Undefined,
    },
    );

    if (this.feedInLimitation.feedInSetting === FeedInSetting.FixedPowerFactor) {
      batteryInverterData.push({
        label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CONSTANT_VALUE"),
        value: this.feedInLimitation.fixedPowerFactor,
      });
    }

    batteryInverterData.push({
      label: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NA_PROTECTION"),
      value: this.feedInLimitation.naProtection,
    });

    const safetyCountry = this.location.isEqualToCustomerData ? this.customer.country : this.location.country;
    batteryInverterData.push({ label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.COUNTRY_SETTING"), value: IbnUtils.getCountryLabel(safetyCountry, this.translate) });

    tableData.push({
      header: Category.INVERTER,
      rows: batteryInverterData,
    });

    const pvData: ComponentData[] = [];

    let pvNr: number = 1;
    for (const dc of this.pv.dc) {
      const mppt: number = pvNr;
      if (dc.isSelected) {
        pvData.push(
          {
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.ALIAS_WITH_LABEL_HOME_DC", { mppt: mppt }),
            value: dc.alias,
          },
          {
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.VALUE_WITH_LABEL_HOME_DC", { mppt: mppt, symbol: "" }),
            value: dc.value,
          },
        );
        if (dc.orientation) {
          pvData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.ORIENTATION_WITH_LABEL_HOME_DC", { mppt: mppt }),
            value: dc.orientation,
          });
        }
        if (dc.moduleType) {
          pvData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.MODULE_TYPE_WITH_LABEL_HOME_DC", { mppt: mppt }),
            value: dc.moduleType,
          });
        }
        if (dc.modulesPerString) {
          pvData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.NUMBER_OF_MODULES_WITH_LABEL_HOME_DC", { mppt: mppt }),
            value: dc.modulesPerString,
          });
        }
        if (this.maxNumberOfMppt > 0) {
          pvData.push({
            label: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.BOTH_SELECTED_LABEL", { pv1: pvNr * 2 - 1, pv2: pvNr * 2 }),
            value: dc.portsConnected ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
          });
        }
      }
      pvNr++;
    }

    // DC
    if (pvData.length > 0) {
      tableData.push({
        header: Category.PRODUCER,
        rows: pvData,
      });
    }

    const gridData: ComponentData[] = [];
    const energyFlowMeter = this.energyFlowMeter;

    // Standard and optional changes based on the home system type.
    // So checking with default meter type. default is always standard.
    const type = energyFlowMeter.meter === this.defaultEnergyFlowMeter
      ? this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD")
      : this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.OPTIONAL");

    gridData.push({
      label: this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.LABEL"),
      value: Meter.toGridMeterCategoryLabelString(energyFlowMeter.meter, this.translate, type),
    });

    if (energyFlowMeter.meter === Meter.GridMeterCategory.COMMERCIAL_METER) {
      gridData.push({
        label: this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.CONVERTER_RATIO"),
        value: energyFlowMeter.value.toString(),
      });
    }

    gridData.push({
      label: this.translate.instant("INSTALLATION.CONFIGURATION_ESS_LIMITER.TITLE"),
      value: this.isController14aActivated ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
    });

    if (gridData.length > 0) {
      tableData.push({
        header: Category.GRID,
        rows: gridData,
      });
    }

    if (this.avu?.isIncluded) {
      const avuData: ComponentData[] = [];

      avuData.push({
        label: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
        value: this.avu.serialNumber,
      });

      tableData.push({
        header: Category.AVU,
        rows: avuData,
      });
    }
  }

  public override getProtocol(edge: Edge, websocket: Websocket): Promise<string> {
    const protocol: SetupProtocol = super.getCommonProtocolItems(edge);

    const feedInLimitation = this.feedInLimitation;
    const emergencyReserve = this.emergencyReserve;
    const energyFlowMeter = this.energyFlowMeter;

    // Standard and optional changes based on the home system type.
    // So checking with default meter type. default is always standard.
    const type = energyFlowMeter.meter === this.defaultEnergyFlowMeter
      ? this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD")
      : this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.OPTIONAL");

    protocol.items.push({
      category: Category.GRID,
      name: this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.LABEL"),
      value: Meter.toGridMeterCategoryLabelString(energyFlowMeter.meter, this.translate, type),
    });

    if (energyFlowMeter.meter === Meter.GridMeterCategory.COMMERCIAL_METER) {
      protocol.items.push({
        category: Category.GRID,
        name: this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.CONVERTER_RATIO"),
        value: energyFlowMeter.value.toString(),
      });
    }

    protocol.items.push({
      category: Category.GRID,
      name: this.translate.instant("INSTALLATION.CONFIGURATION_ESS_LIMITER.TITLE"),
      value: this.isController14aActivated ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
    });

    protocol.items.push({
      category: Category.EMERGENCY_RESERVE,
      name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.EMERGENCY_RESERVE_LABEL", { symbol: "?" }),
      value: emergencyReserve.isEnabled ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
    });

    if (emergencyReserve.isEnabled) {

      if (emergencyReserve.isReserveSocEnabled) {
        protocol.items.push({
          category: Category.EMERGENCY_RESERVE,
          name: this.translate.instant("INSTALLATION.CONFIGURATION_EMERGENCY_RESERVE.EMERGENCY_RESERVE", { symbol: "[%]" }),
          value: emergencyReserve.value ? emergencyReserve.value.toString() : "",
        });
      }
    }

    for (let index = 0; index < this.pv.dc.length; index++) {
      const dc: DcPv = this.pv.dc[index];
      const label: string = "MPPT";
      const dcNr: number = index + 1;

      // DC-PV
      if (dc.isSelected) {
        protocol.items.push(
          {
            category: Category.DC_PV_INSTALLATION,
            name: this.translate.instant("INSTALLATION.ALIAS_WITH_LABEL", { label: label, number: dcNr }),
            value: dc.alias,
          },
          {
            category: Category.DC_PV_INSTALLATION,
            name: this.translate.instant("INSTALLATION.VALUE_WITH_LABEL", { label: label, number: dcNr, symbol: "[Wp]" }),
            value: dc.value ? dc.value.toString() : "",
          },
        );

        dc.orientation && protocol.items.push({
          category: Category.DC_PV_INSTALLATION,
          name: this.translate.instant("INSTALLATION.PROTOCOL_PV.ORIENTATION_WITH_LABEL", { label: label, number: dcNr }),
          value: dc.orientation,
        });

        dc.moduleType && protocol.items.push({
          category: Category.DC_PV_INSTALLATION,
          name: this.translate.instant("INSTALLATION.PROTOCOL_PV.MODULE_TYPE_WITH_LABEL", { label: label, number: dcNr }),
          value: dc.moduleType,
        });

        dc.modulesPerString && protocol.items.push({
          category: Category.DC_PV_INSTALLATION,
          name: this.translate.instant("INSTALLATION.PROTOCOL_PV.NUMBER_OF_MODULES_WITH_LABEL", { label: label, number: dcNr }),
          value: dc.modulesPerString ? dc.modulesPerString.toString() : "",
        });

        if (this.maxNumberOfMppt > 0) {
          protocol.items.push({
            category: Category.DC_PV_INSTALLATION,
            name: this.translate.instant("INSTALLATION.CONFIGURATION_SUMMARY.BOTH_SELECTED_LABEL", { pv1: dcNr * 2 - 1, pv2: dcNr * 2 }),
            value: dc.portsConnected ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
          });
        }
      }
    }

    protocol.items.push(
      {
        category: Category.FEED_IN_MANAGEMENT,
        name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CHOOSE"),
        value: FeedInSetting.getFeedInSettingLabel(feedInLimitation.feedInSetting, this.translate),
      },
    );

    if (feedInLimitation.feedInSetting === FeedInSetting.FixedPowerFactor) {
      protocol.items.push({
        category: Category.FEED_IN_MANAGEMENT,
        name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CONSTANT_VALUE"),
        value: feedInLimitation.fixedPowerFactor,
      });
    }

    protocol.items.push({
      category: Category.FEED_IN_MANAGEMENT,
      name: this.translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.NA_PROTECTION"),
      value: feedInLimitation.naProtection ? this.translate.instant("General.yes") : this.translate.instant("General.no"),
    });

    if (this.avu?.isIncluded) {
      protocol.items.push({
        category: Category.AVU,
        name: this.translate.instant("INSTALLATION.PROTOCOL_AVU_BOX.SERIAL_NUMBER"),
        value: this.avu.serialNumber,
      });
    }

    return new Promise((resolve, reject) => {
      websocket
        .sendRequest(SubmitSetupProtocolRequest.translateFrom(protocol, this.translate))
        .then((response: JsonrpcResponseSuccess) => {
          resolve(response.result["setupProtocolId"]);
        })
        .catch((reason) => {
          reject(reason);
        });
    });
  }

  public override getSystemVariantFields(): FormlyFieldConfig[] {

    const label = [];
    const emsType: EmsType = this.getEmsType();

    switch (emsType) {
      case "feh013":
        label.push(
          { value: SystemId.FENECON_HOME_6, label: SystemId.FENECON_HOME_6 },
          { value: SystemId.FENECON_HOME_10_GEN_2, label: SystemId.FENECON_HOME_10_GEN_2 },
          { value: SystemId.FENECON_HOME_15, label: SystemId.FENECON_HOME_15 },
          { value: SystemId.FENECON_HOME_20, label: SystemId.FENECON_HOME_20 },
          { value: SystemId.FENECON_HOME_30, label: SystemId.FENECON_HOME_30 },
        );
        break;
      case "fho011":
        label.push({ value: SystemId.FENECON_HOME_10, label: SystemId.FENECON_HOME_10 });
        break;
      case null:
        label.push(
          { value: SystemId.FENECON_HOME_6, label: SystemId.FENECON_HOME_6 },
          { value: SystemId.FENECON_HOME_10, label: SystemId.FENECON_HOME_10 },
          { value: SystemId.FENECON_HOME_10_GEN_2, label: SystemId.FENECON_HOME_10_GEN_2 },
          { value: SystemId.FENECON_HOME_15, label: SystemId.FENECON_HOME_15 },
          { value: SystemId.FENECON_HOME_20, label: SystemId.FENECON_HOME_20 },
          { value: SystemId.FENECON_HOME_30, label: SystemId.FENECON_HOME_30 },
        );
        break;
    }

    const fields: FormlyFieldConfig[] = [{
      key: "system",
      type: "radio",
      templateOptions: {
        label: this.translate.instant("INSTALLATION.CONFIGURATION_SYSTEM.PRODUCT_NAME"),
        type: "radio",
        options: label,
        required: true,
      },
    }];

    return fields;
  }

  public override async getComponentConfigurator(edge: Edge, config: EdgeConfig, websocket: Websocket, service?: Service) {
    const componentConfigurator: ComponentConfigurator =
      new ComponentConfigurator(edge, config, websocket);

    // Determine safety country
    const safetyCountry: SafetyCountry = this.location.isEqualToCustomerData
      ? SafetyCountry.getSafetyCountry(this.customer.country)
      : SafetyCountry.getSafetyCountry(this.location.country);

    // Determine feed-in-setting
    let feedInSetting: FeedInSetting;
    const feedInLimitation = this.feedInLimitation;
    feedInLimitation.feedInSetting === FeedInSetting.FixedPowerFactor
      ? feedInSetting = feedInLimitation.fixedPowerFactor
      : feedInSetting = feedInLimitation.feedInSetting;

    // TODO remove
    // system not updated => newest appManager not available
    const homeAppProperties = this.getHomeAppProperties(safetyCountry, feedInSetting);
    const baseMode = AppCenterUtil.isAppManagerAvailable(edge) ? BaseMode.AppManager : BaseMode.UI;

    componentConfigurator.addInstallAppCallback(() => {
      return AppCenterUtil.createOrUpdateApp(
        edge,
        websocket,
        this.homeAppId,
        this.homeAppAlias,
        homeAppProperties,
        AppCenterUtil.keyForIntegratedSystems(),
      );
    });

    if (!this.estimatedConfig) {
      // Send request and process components
      this.estimatedConfig = await edge.sendRequest(
        websocket,
        new ComponentJsonApiRequest({
          componentId: "_appManager",
          payload: new GetEstimatedConfigRequest({
            appId: this.homeAppId,
            alias: this.homeAppAlias,
            properties: homeAppProperties,
          }),
        }),
      );
    }

    // Add components to the configurator
    this.estimatedConfig.result.configurations
      .filter((config) => config.type === "Component")
      .forEach((config) => {
        const components = config.configuration?.components || [];
        components.forEach((component) => {
          const configurationObject: ConfigurationObject = {
            factoryId: component.factoryId,
            componentId: component.id,
            alias: component.id.startsWith("_") ? component.id : component.alias,
            properties: component.properties
              ? Object.entries(component.properties).map(([name, value]) => ({ name, value }))
              : undefined,
            mode: ConfigurationMode.RemoveAndConfigure,
            baseMode: baseMode,
          };

          componentConfigurator.add(configurationObject);
        });
      });

    return componentConfigurator;
  }

  public override setNonAbstractFields(ibnString: any) {

    // Configuration mppt selection
    if ("mppt" in ibnString) {
      this.mppt = ibnString.mppt;
    }

    // protocol pv
    if ("pv" in ibnString) {
      this.pv = ibnString.pv;
    }

    // energyFlowMeter for Home 20 & 30
    if ("energyFlowMeter" in ibnString) {
      this.energyFlowMeter = ibnString.energyFlowMeter;
    }

    // protocol avu box
    this.avu = ibnString.avu;

    // limitController14a
    this.isController14aActivated = ibnString.isController14aActivated;

    this.estimatedConfig = ibnString.estimatedConfig;
  }

  /**
   * Adds the specific DC configuration for the Home variant.
   *
   * @param componentConfigurator configuration object.
   * @param baseMode BaseMode
   */
  public addHomeDcConfiguration(componentConfigurator: ComponentConfigurator, baseMode: BaseMode) {

    // Chargers
    for (let i = 0; i < (this.maxNumberOfMppt > 0 ? this.maxNumberOfMppt : this.maxNumberOfPvStrings); i++) {
      const dc = this.pv.dc[i];
      let factoryId: string;
      let alias: string;

      // Home 20. Home 30 has more than 2 pv strings.
      if (this.maxNumberOfPvStrings > 2) {
        factoryId = "GoodWe.Charger.Two-String";
        alias = "PV " + i;
      } else {
        factoryId = "GoodWe.Charger-PV" + (i + 1);
        alias = "MPPT " + (i + 1);
      }

      if (dc.isSelected) {
        componentConfigurator.add({
          factoryId: factoryId,
          componentId: "charger" + i,
          alias: dc.alias ?? alias,
          properties: [
            { name: "enabled", value: true },
            { name: "essOrBatteryInverter.id", value: "batteryInverter0" },
            { name: "modbus.id", value: "modbus1" },
            { name: "modbusUnitId", value: 247 },
          ],
          mode: dc.isSelected ? ConfigurationMode.RemoveAndConfigure : ConfigurationMode.RemoveOnly,
          baseMode: baseMode,
        });
      }
    }
  }

  /**
   * Returns the options to be displayed in energy flow meter view.
   */
  public getEnergyFlowMeterFields() {
    const type: string = this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD");

    return [
      {
        value: Meter.GridMeterCategory.SMART_METER, //
        label: Meter.toGridMeterCategoryLabelString(Meter.GridMeterCategory.SMART_METER, this.translate, type),
      },
      {
        value: Meter.GridMeterCategory.COMMERCIAL_METER, //
        label: Meter.toGridMeterCategoryLabelString(Meter.GridMeterCategory.COMMERCIAL_METER, this.translate),
      },
    ];
  }

  public commonHomeProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): HomeCommonApp {
    const isDynamicFeedIn =
      this.feedInLimitation.feedInType === FeedInType.DYNAMIC_LIMITATION ||
      this.feedInLimitation.feedInType === FeedInType.DYNAMIC_AND_EXTERNAL_LIMITATION;
    const commonHomeAppProperties: HomeCommonApp = {
      SAFETY_COUNTRY: safetyCountry,
      ...(isDynamicFeedIn && { MAX_FEED_IN_POWER: this.feedInLimitation.maximumFeedInPower }),
      FEED_IN_SETTING: feedInSetting,
      HAS_EMERGENCY_RESERVE: this.emergencyReserve.isEnabled,
      ...(this.emergencyReserve.isEnabled && { EMERGENCY_RESERVE_ENABLED: this.emergencyReserve.isReserveSocEnabled }),
      ...(this.emergencyReserve.isReserveSocEnabled && { EMERGENCY_RESERVE_SOC: this.emergencyReserve.value }),
      ...(this.batteryInverter?.shadowManagementDisabled && { SHADOW_MANAGEMENT_DISABLED: true }),
      HAS_ESS_LIMITER_14A: this.isController14aActivated,
      NA_PROTECTION_ENABLED: this.feedInLimitation.naProtection,
    };

    return commonHomeAppProperties;
  }

  public additonalHomeProperties(): HomeAdditionalApp {
    const additionalHomeAppProperties: HomeAdditionalApp = {
      FEED_IN_TYPE: this.feedInLimitation.feedInType,
      GRID_METER_CATEGORY: this.energyFlowMeter.meter,
      ...(this.energyFlowMeter.meter === Meter.GridMeterCategory.COMMERCIAL_METER && { CT_RATIO_FIRST: this.energyFlowMeter.value }),
    };

    return additionalHomeAppProperties;
  }

  /**
   * @returns the fields that are only applicable for Gen2 systems.
   */
  public getGen2EnergyFlowMeterFields() {

    const standardType: string = this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.STANDARD");
    const optionalType: string = this.translate.instant("INSTALLATION.CONFIGURATION_ENERGY_FLOW_METER.METER.TYPE.OPTIONAL");

    const options: {
      value: Meter.GridMeterCategory;
      label: string;
    }[] = [
        {
          value: Meter.GridMeterCategory.SMART_METER, //
          label: Meter.toGridMeterCategoryLabelString(Meter.GridMeterCategory.SMART_METER, this.translate, optionalType),
        },
        {
          value: Meter.GridMeterCategory.INTEGRATED_METER, //
          label: Meter.toGridMeterCategoryLabelString(Meter.GridMeterCategory.INTEGRATED_METER, this.translate, standardType),
        },
      ];

    return options;
  }

  public override removeOrAddView(edge: Edge): void {
    super.removeOrAddView(edge);
    this.removeOrAddEssLimiter14aView();
  }

  /**
   * Generates and returns the Specific properties required for Home APP variant.
   *
   * @param safetyCountry Safety Country configured.
   * @param feedInSetting Feed in Setting configured.
   * @returns The Home APP properties of the specific variant.
   */
  public abstract getHomeAppProperties(safetyCountry: SafetyCountry, feedInSetting: FeedInSetting): {};

  /**
   * Returns the appropriate label to be displayed during the "ConfigurationMpptSelection" and "ProtocolPV"
   *
   * @param mppt the mppt number
   * @param pv the pv number
   */
  public abstract getMpptLabel(mppt: number, pv: number);
}
