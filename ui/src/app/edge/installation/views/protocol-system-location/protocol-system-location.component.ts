import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { FormlyUtils } from "src/app/shared/components/formly/formly-utils";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { Edge, Websocket } from "src/app/shared/shared";
import { COUNTRY_OPTIONS, CountryUtils } from "src/app/shared/type/country";
import { ObjectUtils } from "src/app/shared/utils/object/object.utils";
import { environment, Environment } from "src/environments";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { ComponentData } from "../../shared/ibndatatypes";
import { GeoCodeJsonRpc, GeoResult } from "./json-rpc/geo-code-json-rpc";

interface LocationModel {
    street: string;
    zip: string;
    city: string;
    country: string;
}

@Component({
    selector: "protocol-system-location",
    templateUrl: "./protocol-system-location.component.html",
    standalone: false,
})
export class ProtocolSystemLocationValidationComponent implements OnInit {
    @Input() public ibn!: AbstractIbn;
    @Input() public edge!: Edge;

    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

    protected form: FormGroup = new FormGroup({});
    protected fields: FormlyFieldConfig[] = [];
    protected model: LocationModel = {
        street: "",
        zip: "",
        city: "",
        country: "",
    };

    protected geoCodeForm: FormGroup = new FormGroup({});
    protected geoCodeFields: FormlyFieldConfig[] = [{
        key: "index",
        type: "radio",
        props: {
            radioSlot: "start",
            label: this.translate.instant("INSTALLATION.PROTOCOL_SYSTEM_LOCATION_VALIDATION.GEO_CODE_RESULT_LABEL"),
            options: [],
            required: true,
        },
    }];
    protected geoCodeModel: { index: number | null } = { index: null };

    protected readonly environment: Environment = environment;
    protected isValidating: boolean = false;
    protected isWaiting: boolean = false;
    protected addressesAvailable: boolean = false;
    protected isNextDisabled: boolean = true;
    protected id: number | null = null;
    protected unkownAddressOptionIndex: number = 0;

    private geoResults: GeoResult[] = [];

    constructor(private translate: TranslateService, private websocket: Websocket) { }

    public ngOnInit() {
        this.fields = this.generateFields();
        const location = this.getLocation();
        this.model = {
            city: location?.city ?? "",
            country: location?.country ?? "",
            street: location?.street ?? "",
            zip: location?.zip ?? "",
        };
        this.id = this.edge.getNameNumber();
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public async onNextClicked() {

        this.isWaiting = true;
        if (this.form.invalid || this.geoCodeForm.invalid) {
            this.isWaiting = false;
            return;
        }

        const selectedIndex = this.geoCodeModel.index;

        if (selectedIndex === this.unkownAddressOptionIndex) {
            // Unknown address option selected
            this.isWaiting = false;
            this.nextViewEvent.emit(this.ibn);
            return;
        }

        if (typeof selectedIndex !== "number" || selectedIndex < 0 || selectedIndex >= this.geoResults.length) {
            console.error("Invalid or missing GeoResult index.");
            this.isWaiting = false;
            return;
        }
        const selectedGeo: GeoResult = this.geoResults[selectedIndex];
        this.fillLocationFromGeoResult(selectedGeo);

        // Defaults based on edge implementation are set incase the values are null.
        const properties = [
            { name: "placeName", value: selectedGeo.placeName ?? "" },
            { name: "postcode", value: selectedGeo.postcode ?? "" },
            { name: "latitude", value: selectedGeo.latitude ?? -999.0 },
            { name: "longitude", value: selectedGeo.longitude ?? -999.0 },
            { name: "timezone", value: selectedGeo.timezone ?? "" },
            { name: "subdivisionCode", value: selectedGeo.subdivisionCode?.replace("-", "_") ?? "UNDEFINED" },// DE-BY -> DE_BY
        ];

        await this.edge.updateAppConfig(this.websocket, "_meta", properties);

        this.isWaiting = false;
        this.nextViewEvent.emit(this.ibn);
    }

    public generateFields(): FormlyFieldConfig[] {
        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "street",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_INSTALLER_AND_CUSTOMER.STREET_ADDRESS"),
                required: true,
            },
        });

        fields.push({
            key: "zip",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_INSTALLER_AND_CUSTOMER.ZIP"),
                required: true,
            },
            validators: {
                validation: ["zip"],
            },
        });

        fields.push({
            key: "city",
            type: "input",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_INSTALLER_AND_CUSTOMER.CITY"),
                required: true,
            },
        });

        fields.push({
            key: "country",
            type: "select",
            templateOptions: {
                label: this.translate.instant("INSTALLATION.PROTOCOL_INSTALLER_AND_CUSTOMER.COUNTRY"),
                required: true,
                options: COUNTRY_OPTIONS(this.translate),
            },
        });

        return fields;
    }

    protected async validation(): Promise<void> {
        const { street, zip, city, country } = this.model;
        const geoCode = `${street}, ${zip}, ${city}, ${country}`;
        this.isValidating = true;
        this.isNextDisabled = true;

        try {
            const response = await this.edge.sendRequest(
                this.websocket,
                new ComponentJsonApiRequest({
                    componentId: "_meta",
                    payload: new GeoCodeJsonRpc.Request({ query: geoCode }),
                })
            );

            const result = (response as GeoCodeJsonRpc.Response).result.geocodingResults;
            this.geoCodeForm = new FormGroup({});
            this.fillGeoCodeFields(result);
            this.addressesAvailable = Array.isArray(result) && result.length > 0;

            this.geoResults = result ?? [];
        } catch (err) {
            console.error("GeoCode validation failed:", err);
            this.addressesAvailable = false;
            this.isNextDisabled = true;
        } finally {
            this.isValidating = false;
            this.isNextDisabled = false;
        }
    }

    private fillGeoCodeFields(results?: GeoResult[]) {
        const options: ComponentData[] = [];

        let selectedIndex = 0;

        results?.forEach((geoCode, index) => {
            const street = geoCode.road && geoCode.houseNumber
                ? `${geoCode.road} ${geoCode.houseNumber}, `
                : "";

            const label = `${street}${geoCode.postcode ?? ""}, ${geoCode.placeName ?? ""}, ${geoCode.country ?? ""}`;
            const hasNotMinRequirements = Object.values(ObjectUtils.pickProperties(geoCode, ["country", "postcode", "road"])).some((el) => el === null);

            if (hasNotMinRequirements) {
                return;
            }

            options.push({ value: index, label });

            if (this.isMatchingAddress(geoCode)) {
                selectedIndex = index;
            }
        });

        if (!this.hasMatchingAddress(results)) {
            const lastIndex = options.length;
            options.push({
                value: options.length,
                label: this.translate.instant("INSTALLATION.PROTOCOL_SYSTEM_LOCATION_VALIDATION.UNKNOWN_ADDRESS"),
                default: options.length == 0,
            });

            this.unkownAddressOptionIndex = lastIndex;
        }

        this.geoCodeFields = FormlyUtils.changeFormlyFieldProps("index", this.geoCodeFields, (props) => {
            if (props == null) {
                return props;
            }

            props.options = options;
            return props;
        });

        this.geoCodeModel.index = selectedIndex;
    }

    private getLocation() {
        return this.ibn?.location?.isEqualToCustomerData ? this.ibn?.customer : this.ibn?.location;
    }

    private fillLocationFromGeoResult(selectedGeo: GeoResult) {
        const location = this.getLocation();

        if (location == null) {
            return;
        }

        const streetInfoExists: boolean = selectedGeo.road != null && selectedGeo.houseNumber != null;
        location.street = streetInfoExists ? `${selectedGeo.road}, ${selectedGeo.houseNumber}` : location.street;
        location.city = selectedGeo.placeName ?? location.city;
        location.zip = selectedGeo.postcode ?? location.zip;

        const countryCode = selectedGeo.country ? CountryUtils.fromCountryCode(selectedGeo.country) : null;
        location.country = countryCode ?? location.country;
    }

    private hasMatchingAddress(results?: GeoResult[]): boolean {
        if (!results || results.length === 0) {
            return false;
        }

        return results.some(result => {
            return this.isMatchingAddress(result);
        });
    }

    private isMatchingAddress(geo: GeoResult): boolean {
        const street = geo.road && geo.houseNumber
            ? `${geo.road}, ${geo.houseNumber}`
            : "";

        return street === this.model.street &&
            geo.postcode === this.model.zip &&
            geo.placeName === this.model.city &&
            CountryUtils.fromCountryCode(geo.country ?? "") === this.model.country;
    }
}
