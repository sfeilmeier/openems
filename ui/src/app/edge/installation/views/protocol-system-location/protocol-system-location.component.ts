import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { GeoResult, LocationModel, SystemLocationValidatorComponent } from "src/app/shared/components/system-location-validator/system-location-validator.component";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { CountryUtils } from "src/app/shared/type/country";
import { AssertionUtils } from "src/app/shared/utils/assertions/assertions.utils";
import { environment, Environment } from "src/environments";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";

@Component({
    selector: "protocol-system-location",
    templateUrl: "./protocol-system-location.component.html",
    standalone: false,
})
export class ProtocolSystemLocationValidationComponent implements OnInit {
    @Input() public ibn: AbstractIbn | null = null;
    @Input() public edge!: Edge;

    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

    @ViewChild(SystemLocationValidatorComponent) public validator!: SystemLocationValidatorComponent;

    protected readonly environment: Environment = environment;
    protected locationModel: LocationModel | null = null;
    protected isNextDisabled: boolean = true;
    protected isWaiting: boolean = false;

    constructor(
        protected websocket: Websocket,
        private translate: TranslateService,
        private service: Service) { }

    public static getLocation(ibn: AbstractIbn | null) {
        if (ibn == null) {
            return null;
        }
        return ibn?.location?.isEqualToCustomerData ? ibn?.customer : ibn?.location;
    }

    public ngOnInit() {
        const location = ProtocolSystemLocationValidationComponent.getLocation(this.ibn);
        this.locationModel = {
            city: location?.city ?? "",
            country: location?.country ?? "",
            street: location?.street ?? "",
            zip: location?.zip ?? "",
        };
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public async onNextClicked() {
        AssertionUtils.assertIsDefined(this.ibn);
        this.isWaiting = true;

        // Trigger the Save Logic in the Shared Component
        const result = await this.validator.save();

        // Handle the Result
        if (result.status === "INVALID") {
            this.isWaiting = false;
            return; // Stop navigation
        }

        if (result.status === "SUCCESS") {
            // Update Local IBN Data (Tool specific logic)
            this.fillLocationFromGeoResult(result.geoResult);
        }

        // Proceed (covers both SUCCESS and UNKNOWN_ADDRESS_SELECTED)
        this.isWaiting = false;
        this.nextViewEvent.emit(this.ibn);
    }

    public onValidatorBusy(isBusy: boolean) {
        // Disable the "Next" button while the validator is working
        this.isNextDisabled = isBusy;
    }

    private fillLocationFromGeoResult(selectedGeo: GeoResult) {
        const location = ProtocolSystemLocationValidationComponent.getLocation(this.ibn);

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
}
