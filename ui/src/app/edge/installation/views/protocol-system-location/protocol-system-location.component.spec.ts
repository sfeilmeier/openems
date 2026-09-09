import { GeoResult, SaveResult, } from "src/app/shared/components/system-location-validator/system-location-validator.component";
import { Websocket } from "src/app/shared/shared";
import { Country } from "src/app/shared/type/country";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { ProtocolSystemLocationValidationComponent } from "./protocol-system-location.component";

type IbnLocation = NonNullable<AbstractIbn["location"]>;

function buildGeoResult(overrides: Partial<GeoResult> = {}): GeoResult {
    return {
        country: "Austria",
        countryCode: "AT",
        currency: "EUR",
        houseNumber: "1-5",
        latitude: "48.7959372",
        longitude: "15.408714",
        openStreetMapUrl: "",
        placeName: "Waldreichs",
        postcode: "3812",
        road: "Test-Fuchs-Straße",
        subdivision: "Lower Austria",
        subdivisionCode: "AT-3",
        timezone: "Europe/Vienna",
        ...overrides,
    };
}

function buildIbn(location: IbnLocation, customer?: AbstractIbn["customer"]): AbstractIbn {
    return {
        location,
        customer,
    } as unknown as AbstractIbn;
}

describe("ProtocolSystemLocationValidationComponent", () => {
    let component: ProtocolSystemLocationValidationComponent;

    beforeEach(() => {
        component = new ProtocolSystemLocationValidationComponent({} as Websocket);
    });

    describe("#getLocation", () => {
        it("returns null if ibn is null", () => {
            expect(ProtocolSystemLocationValidationComponent.getLocation(null)).toBeNull();
        });

        it("returns ibn.location if isEqualToCustomerData is false", () => {
            const location = { isEqualToCustomerData: false, city: "Location City" } as IbnLocation;
            const ibn = buildIbn(location);

            expect(ProtocolSystemLocationValidationComponent.getLocation(ibn)).toEqual(location);
        });

        it("returns ibn.customer if location.isEqualToCustomerData is true", () => {
            const location = { isEqualToCustomerData: true, city: "Location City" } as IbnLocation;
            const customer = { city: "Customer City" } as AbstractIbn["customer"];
            const ibn = buildIbn(location, customer);

            expect(ProtocolSystemLocationValidationComponent.getLocation(ibn)).toEqual(customer);
        });
    });

    describe("#ngOnInit", () => {
        it("initializes the locationModel from the resolved location", () => {
            component.ibn = buildIbn({
                isEqualToCustomerData: false,
                city: "Berlin",
                country: Country.GERMANY,
                street: "Main Street 1",
                zip: "12345",
            } as IbnLocation);

            component.ngOnInit();

            expect((component as any).locationModel).toEqual({
                city: "Berlin",
                country: Country.GERMANY,
                street: "Main Street 1",
                zip: "12345",
            });
        });

        it("falls back to empty strings when there is no location", () => {
            component.ibn = null;

            component.ngOnInit();

            expect((component as any).locationModel).toEqual({ city: "", country: "", street: "", zip: "" });
        });
    });

    describe("#onNextClicked", () => {
        function setupWithValidatorResult(result: SaveResult, location: IbnLocation) {
            component.ibn = buildIbn(location);
            component.validator = { save: jasmine.createSpy("save").and.resolveTo(result) } as any;

            const nextViewSpy = jasmine.createSpy("nextViewEvent");
            component.nextViewEvent.subscribe(nextViewSpy);

            return nextViewSpy;
        }

        it("maps the selected GeoResult's countryCode (not the country name) onto the location", async () => {
            const location = {
                isEqualToCustomerData: false,
                city: "Old City",
                country: Country.GERMANY,
                street: "Old Street",
                zip: "00000",
            } as IbnLocation;

            const nextViewSpy = setupWithValidatorResult({ status: "SUCCESS", geoResult: buildGeoResult() }, location);

            await component.onNextClicked();

            expect(location.country).toEqual(Country.AUSTRIA);
            expect(location.city).toEqual("Waldreichs");
            expect(location.zip).toEqual("3812");
            expect(location.street).toEqual("Test-Fuchs-Straße, 1-5");
            expect(nextViewSpy).toHaveBeenCalledWith(component.ibn);
        });

        it("keeps the previous values when the GeoResult has no countryCode/street/city/zip", async () => {
            const location = {
                isEqualToCustomerData: false,
                city: "Old City",
                country: Country.GERMANY,
                street: "Old Street",
                zip: "00000",
            } as IbnLocation;

            setupWithValidatorResult(
                {
                    status: "SUCCESS",
                    geoResult: buildGeoResult({
                        countryCode: null as any,
                        placeName: null as any,
                        postcode: null as any,
                        road: null as any,
                        houseNumber: null as any,
                    }),
                },
                location,
            );

            await component.onNextClicked();

            expect(location.country).toEqual(Country.GERMANY);
            expect(location.city).toEqual("Old City");
            expect(location.zip).toEqual("00000");
            expect(location.street).toEqual("Old Street");
        });

        it("does not touch the location and stops navigation when the validator reports INVALID", async () => {
            const location = { isEqualToCustomerData: false, country: Country.GERMANY } as IbnLocation;

            const nextViewSpy = setupWithValidatorResult({ status: "INVALID" }, location);

            await component.onNextClicked();

            expect(location.country).toEqual(Country.GERMANY);
            expect(nextViewSpy).not.toHaveBeenCalled();
            expect((component as any).isWaiting()).toBeFalse();
        });

        it("proceeds without changing the location when an unknown address is selected", async () => {
            const location = { isEqualToCustomerData: false, country: Country.GERMANY } as IbnLocation;

            const nextViewSpy = setupWithValidatorResult({ status: "UNKNOWN_ADDRESS_SELECTED" }, location);

            await component.onNextClicked();

            expect(location.country).toEqual(Country.GERMANY);
            expect(nextViewSpy).toHaveBeenCalledWith(component.ibn);
        });
    });

    describe("#onPreviousClicked", () => {
        it("emits previousViewEvent", () => {
            const previousViewSpy = jasmine.createSpy("previousViewEvent");
            component.previousViewEvent.subscribe(previousViewSpy);

            component.onPreviousClicked();

            expect(previousViewSpy).toHaveBeenCalled();
        });
    });

    describe("#onValidatorBusy", () => {
        it("disables the next button while the validator is busy", () => {
            component.onValidatorBusy(true);
            expect((component as any).isNextDisabled).toBeTrue();

            component.onValidatorBusy(false);
            expect((component as any).isNextDisabled).toBeFalse();
        });
    });
});
