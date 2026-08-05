// @ts-strict-ignore
import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, signal } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { ArrayUtils } from "src/app/shared/utils/array/array.utils";
import { ObjectUtils } from "src/app/shared/utils/object/object-utils";
import { environment } from "src/environments";
import { AbstractIbn, BatteryTowerSettings } from "../../installation-systems/abstract-ibn";
import { Commercial92Ibn } from "../../installation-systems/commercial/commercial-92/commercial92";
import { ComponentData, SerialNumberFormData } from "../../shared/ibndatatypes";

@Component({
    selector: ProtocolSerialNumbersComponent.SELECTOR,
    templateUrl: "./protocol-serial-numbers.component.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ProtocolSerialNumbersComponent implements OnInit {
    private static readonly SELECTOR = "protocol-serial-numbers";

    @Input() public ibn: AbstractIbn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

    protected batterySettingsForms: {
        formGroup: FormGroup;
        fields: FormlyFieldConfig[];
        model: BatteryTowerSettings;
    }[] = [];

    protected forms: SerialNumberFormData[] = [];
    protected numberOfTowersPerBattery: number[] = [];
    protected numberOfModulesPerTowerPerBattery: number[] = [];
    protected spinnerId: string;
    protected readonly isWaiting = signal<boolean>(false);
    protected isCommercial92: boolean | null = null;
    protected readonly environment = environment;
    protected showRetryScreen: boolean = false;
    protected isManualEntryMode: boolean = false;
    private duplicateSerialNumbers: string[] = [];

    constructor(
        private service: Service,
        private websocket: Websocket,
        private translate: TranslateService,
    ) {}

    public ngOnInit(): void {
        this.spinnerId = "installation-serial-number-spinner";
        this.isCommercial92 = this.ibn instanceof Commercial92Ibn;
        this.setIsWaiting(true);

        this.initializeComponentSettings()
            .catch((error) => {
                console.error("A critical error occurred during component initialization:", error);
                this.service.toast(this.translate.instant("GENERAL.FORMLY.INITIALIZING_ERROR"), "danger");
            })
            .finally(() => {
                this.setIsWaiting(false);
            });
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        if (!this.batterySettingsForms.every((form) => form.formGroup.valid)) {
            this.service.toast(
                this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.READ_DESCRIPTION"),
                "danger",
            );
            return;
        }

        for (const form of this.forms) {
            for (const fieldSetting of form.fieldSettings) {
                if (fieldSetting.form.invalid) {
                    this.service.toast(
                        this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.INVALID_SERIALNUMBER_KEY", {
                            key: fieldSetting.key,
                            header: form.header,
                        }),
                        "danger",
                        5000,
                    );
                    return;
                }
            }
            if (form.formTower.invalid) {
                return;
            }
        }

        this.ibn.serialNumbers.batteriesData = [];

        for (const form of this.forms) {
            let serialNumbers: ComponentData[] = [];
            serialNumbers = this.extractSerialNumbers(form.fieldSettings);
            const batteriesData = [];

            batteriesData.push({
                label: form.header,
                modules: serialNumbers,
            });

            this.ibn.serialNumbers.batteriesData.push(...batteriesData);
        }

        // Duplicates check.
        if (this.duplicateSerialNumbers.length !== 0) {
            this.service.toast(
                this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.SAME_SERIAL_NUMBERS", {
                    serialNumbers: this.duplicateSerialNumbers,
                }),
                "warning",
            );
            return;
        }

        // Store form models
        this.ibn.serialNumbers.formModels = this.forms.map((form) => ({ ...form.model }));

        this.nextViewEvent.emit(this.ibn);
    }

    public setIsWaiting(isWaiting: boolean) {
        this.isWaiting.set(isWaiting);

        if (isWaiting) {
            this.service.startSpinner(this.spinnerId);
        } else {
            this.service.stopSpinner(this.spinnerId);
        }
    }

    /**
     * Updates the tower and module information based on manual update.
     *
     * @returns The updated number of towers and modules per tower.
     */
    public async saveSettings() {
        const allValid = this.batterySettingsForms.every((form) => form.formGroup.valid);
        if (!allValid) {
            this.service.toast(
                this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.ENTER_VALID_ADDRESS"),
                "warning",
            );
            return;
        }

        // Expand form-model entries via the ibn (Commercial100 replicates for each battery input)
        const expanded = this.ibn.expandBatteryFormModels(this.batterySettingsForms.map((f) => f.model));
        this.numberOfTowersPerBattery = expanded.map((s) => s.numberOfTowers);
        this.numberOfModulesPerTowerPerBattery = expanded.map((s) => s.numberOfModulesPerTower);

        // Update stored configuration
        this.ibn.serialNumbers.numberOfTowers = this.numberOfTowersPerBattery;
        this.ibn.serialNumbers.numberOfModulesPerTower = this.numberOfModulesPerTowerPerBattery;

        // Clear outdated models
        this.ibn.serialNumbers = ObjectUtils.excludeProperties(this.ibn.serialNumbers, ["formModels"]);

        this.setIsWaiting(true);
        this.initializeAllFields().then(() => {
            this.setIsWaiting(false);
        });
    }

    /**
     * Initializes all fields such as number of tower and modules per tower and also indiviaul components fo the system
     * and modules. All the information that can be read directly are read directly from the registers.
     *
     * @returns The Settings fields for towers and also individual modules fields.
     */
    public initializeAllFields(): Promise<void> {
        return new Promise((resolve) => {
            if (ObjectUtils.isObjectNullOrEmpty(this.ibn.serialNumbers)) {
                this.ibn.serialNumbers = {
                    numberOfTowers: this.numberOfTowersPerBattery,
                    numberOfModulesPerTower: this.numberOfModulesPerTowerPerBattery,
                    batteriesData: [],
                };

                if (this.ibn.isDoubleSocketValid) {
                    // Initialize doubleSocket if not present
                    if (ObjectUtils.isObjectNullOrEmpty(this.ibn.serialNumbers.doubleSocket)) {
                        this.ibn.serialNumbers.doubleSocket = {
                            label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.DOUBLE_SOCKET_LABEL"),
                            isEnabled: this.numberOfTowersPerBattery.map((towers) => Array(towers).fill(false)),
                        };
                    }
                }
            }

            // Check if we can reuse stored models
            const totalTowers = this.numberOfTowersPerBattery.reduce(ArrayUtils.ReducerFunctions.sum, 0);
            const canReuseModels =
                this.ibn.serialNumbers?.formModels?.length === totalTowers &&
                ArrayUtils.equalsCheck(this.numberOfTowersPerBattery, this.ibn.serialNumbers.numberOfTowers) &&
                ArrayUtils.equalsCheck(
                    this.numberOfModulesPerTowerPerBattery,
                    this.ibn.serialNumbers.numberOfModulesPerTower,
                );

            if (canReuseModels) {
                const forms: SerialNumberFormData[] = [];
                let modelIndex = 0;

                this.numberOfTowersPerBattery.forEach((numberOfTowers, batteryIndex) => {
                    const numberOfModulesPerTower = this.numberOfModulesPerTowerPerBattery[batteryIndex];

                    for (let towerIndex = 0; towerIndex < numberOfTowers; towerIndex++) {
                        forms.push({
                            fieldSettings: this.ibn.getSerialNumberFields(
                                towerIndex,
                                numberOfModulesPerTower,
                                batteryIndex,
                            ),
                            model: { ...this.ibn.serialNumbers.formModels[modelIndex] },
                            formTower: new FormGroup({}),
                            header: this.ibn.getSerialNumberCategoryHeader(towerIndex, batteryIndex),
                        });
                        modelIndex++;
                    }
                });

                this.forms = forms;
                resolve();
                return;
            }

            // Map each battery to its promises (towers)
            const batteryPromises: Promise<{}>[][] = this.numberOfTowersPerBattery.map((numberOfTowers, index) => {
                const numberOfModulesPerTower = this.numberOfModulesPerTowerPerBattery[index];
                return this.ibn.readSerialNumbersFromRegisters(
                    this.edge,
                    this.websocket,
                    numberOfTowers,
                    numberOfModulesPerTower,
                    index,
                );
            });

            // Flatten array of arrays into single promise array
            const flattenedPromises = batteryPromises.flat();

            Promise.all(flattenedPromises).then((modelsArray) => {
                const dataFound = modelsArray.some((model) => model && Object.keys(model).length > 0);

                if (!dataFound && !this.isManualEntryMode) {
                    this.showRetryScreen = true;
                } else {
                    this.showRetryScreen = false;
                }

                const forms: SerialNumberFormData[] = [];
                let modelIndex = 0;

                // Iterate through each battery's configuration
                this.numberOfTowersPerBattery.forEach((numberOfTowers, batteryIndex) => {
                    const numberOfModulesPerTower = this.numberOfModulesPerTowerPerBattery[batteryIndex];

                    // Create form entries for each tower in the battery
                    for (let towerIndex = 0; towerIndex < numberOfTowers; towerIndex++) {
                        const model = modelsArray[modelIndex];
                        forms.push({
                            fieldSettings: this.ibn.getSerialNumberFields(
                                towerIndex,
                                numberOfModulesPerTower,
                                batteryIndex,
                            ),
                            model: model,
                            formTower: new FormGroup({}),
                            header: this.ibn.getSerialNumberCategoryHeader(towerIndex, batteryIndex),
                        });
                        modelIndex++;
                    }
                });

                this.forms = forms;
                resolve();
            });
        });
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

            const checkboxfield = field.props.checkbox;
            if (this.ibn.isDoubleSocketValid && checkboxfield) {
                const value = checkboxfield.value ?? false;

                serialNumbers.push({
                    label: this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.DOUBLE_SOCKET"),
                    value: value,
                });
            }
        }

        // check if there are duplicates and add it to duplicates array to display later in alert.
        // Collect the duplicate values..
        const duplicateValues = serialNumbers
            .map((v) => v.value)
            .filter((v, i, valueArray) => valueArray.indexOf(v) !== i);

        // Based on the Id's collect the Labels to display in the alert.
        serialNumbers
            .filter((obj) => duplicateValues.includes(obj.value))
            .forEach((value) => this.duplicateSerialNumbers.push(value.label));

        return serialNumbers;
    }

    public async retryFetch() {
        this.isManualEntryMode = false; // Reset manual mode

        this.service.startSpinner(this.spinnerId);

        // Check whether edge is online
        this.edge = await this.service.updateCurrentEdge(this.edge.id);

        if (!this.edge.isOnline) {
            this.service.stopSpinner(this.spinnerId);
            return;
        }

        this.saveSettings();
    }

    public enableManualEntry() {
        this.isManualEntryMode = true;
        this.showRetryScreen = false;
    }

    /** Fetches settings and initializes the component's forms and fields. */
    private async initializeComponentSettings(): Promise<void> {
        const { numberOfTowers, numberOfModulesPerTower } = this.ibn.serialNumbers || {};

        const hasStoredSettings =
            Array.isArray(this.ibn.serialNumbers?.numberOfTowers) &&
            Array.isArray(this.ibn.serialNumbers?.numberOfModulesPerTower) &&
            numberOfTowers.length === numberOfModulesPerTower.length;

        if (hasStoredSettings) {
            // Restore the full expanded arrays from stored data
            numberOfTowers.forEach((towers, index) => {
                this.numberOfTowersPerBattery[index] = towers;
                this.numberOfModulesPerTowerPerBattery[index] = numberOfModulesPerTower[index];
            });

            // Build form cards from the collapsed view (e.g. 1 card for Commercial100
            // even when multiple battery inputs expand the stored arrays)
            const expandedSettings = numberOfTowers.map((towers, index) => ({
                numberOfTowers: towers,
                numberOfModulesPerTower: numberOfModulesPerTower[index],
            }));
            // No-op for most systems, but Commercial100 overrides this to merge multiple
            // battery inputs back into a single form card.
            this.ibn.collapseToFormSettings(expandedSettings).forEach((setting) => {
                this.createBatterySettingForms(setting);
            });
        } else {
            // Fetch data and handle the potential error with .catch().
            // The 'await' here will either resolve with the settings or reject with default values.
            const towerSettings = await this.ibn.getPreSettingInformationFromEdge(this.edge, this.websocket);

            // Build the settings-form cards from the collapsed view (e.g. 1 card for Commercial100
            // even when multiple battery inputs share the same tower/module configuration)
            towerSettings.forEach((setting) => this.createBatterySettingForms(setting));

            // Expand to one entry per actual battery input, so the serial-number forms below are
            // generated per battery input (e.g. Commercial100 replicates across battery1, battery2, ...)
            const expandedSettings = this.ibn.expandBatteryFormModels(towerSettings);
            expandedSettings.forEach((setting, index) => {
                this.numberOfTowersPerBattery[index] = setting.numberOfTowers;
                this.numberOfModulesPerTowerPerBattery[index] = setting.numberOfModulesPerTower;
            });
        }

        // Initialize all form fields based on the settings
        await this.initializeAllFields();
    }

    private createBatterySettingForms(towerSetting: BatteryTowerSettings) {
        const formGroup = new FormGroup({});
        const fields = this.ibn.getPreSettingsFields(towerSetting.numberOfModulesPerTower, towerSetting.numberOfTowers);
        const model = { ...towerSetting };

        this.batterySettingsForms.push({ formGroup, fields, model });
    }
}
