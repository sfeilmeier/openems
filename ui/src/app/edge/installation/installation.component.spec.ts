import { TranslateService } from "@ngx-translate/core";
import { Edge, Logger, Service, Websocket } from "src/app/shared/shared";
import { TestingUtils } from "../../shared/components/shared/testing/utils.spec";
import { Country } from "../../shared/type/country";
import { AbstractIbn } from "./installation-systems/abstract-ibn";
import { InstallationComponent } from "./installation.component";
import { View } from "./shared/enums";
import { System, SystemId } from "./shared/system";
import { ViewUtils } from "./shared/view.utils";

describe("InstallationComponent", () => {
    let translate: TranslateService;
    let navigateSpy: jasmine.Spy;
    let component: InstallationComponent;
    let ibn: AbstractIbn;

    function goToView(view: View): void {
        component.goToNextView(ibn);
        component["navigateTo"](ibn.views.indexOf(view));
    }

    /**
     * Removes the 14a view from the list, as it happens e.g. after a previous installation outside Germany. In Germany,
     * {@link AbstractIbn.removeOrAddView} inserts it again on the next navigation - before the displayed view.
     */
    function removeViewBeforeDisplayed(displayedView: View): void {
        ibn.customer = { ...ibn.customer, country: Country.GERMANY } as AbstractIbn["customer"];
        ibn.location = { ...ibn.location, isEqualToCustomerData: true } as AbstractIbn["location"];
        goToView(displayedView);
        ViewUtils.remove(ibn.views, View.ConfigurationEssLimiter14aComponent);
        component["navigateTo"](ibn.views.indexOf(displayedView));
    }

    beforeEach(async () => {
        translate = (await TestingUtils.sharedSetup()).translate;
        sessionStorage.clear();
        navigateSpy = jasmine.createSpy("navigate");
        const service = { startSpinner: () => {}, stopSpinner: () => {} } as unknown as Service;
        const logger = { debug: () => {} } as unknown as Logger;
        component = new InstallationComponent(
            service,
            { navigate: navigateSpy } as never,
            {} as Websocket,
            translate,
            logger,
        );
        component.ngOnInit();
        component.updateEdge({ id: "edge0" } as Edge);
        ibn = System.getSystemObjectFromSystemId(SystemId.COMMERCIAL_100, translate);
    });

    afterEach(() => sessionStorage.clear());

    describe("#goToNextView on the last view", () => {
        it("navigates to the online monitoring of the edge", () => {
            goToView(View.Completion);
            component.goToNextView();
            expect(navigateSpy).toHaveBeenCalledOnceWith(["device", "edge0"]);
        });

        it("navigates to the online monitoring even if a view was inserted before the displayed one", () => {
            removeViewBeforeDisplayed(View.Completion);
            component.goToNextView();
            expect(navigateSpy).toHaveBeenCalledOnceWith(["device", "edge0"]);
        });

        it("navigates to the overview if no edge is known", () => {
            goToView(View.Completion);
            component.updateEdge(null as unknown as Edge);
            component.goToNextView();
            expect(navigateSpy).toHaveBeenCalledOnceWith(["/overview"]);
        });

        it("clears the stored installation", () => {
            goToView(View.Completion);
            expect(sessionStorage.getItem("ibn")).not.toBeNull();
            component.goToNextView();
            expect(sessionStorage.getItem("ibn")).toBeNull();
            expect(sessionStorage.getItem("viewIndex")).toBeNull();
        });

        for (const systemId of Object.values(SystemId)) {
            it(`navigates to the online monitoring for ${systemId}`, () => {
                ibn = System.getSystemObjectFromSystemId(systemId, translate);
                goToView(View.Completion);
                component.goToNextView();
                expect(navigateSpy).toHaveBeenCalledOnceWith(["device", "edge0"]);
            });
        }
    });

    describe("#goToNextView", () => {
        it("shows the next startup view while no system is selected yet", () => {
            expect(component.currentView()).toBe(View.PreInstallation);
            component.goToNextView();
            expect(component.currentView()).toBe(View.PreInstallationUpdate);
            expect(component.ibn()).toBeNull();
        });

        it("stores the updated ibn and shows the next view", () => {
            goToView(View.ProtocolInstaller);
            component.goToNextView(ibn);
            expect(component.ibn()).toBe(ibn);
            expect(JSON.parse(sessionStorage.getItem("ibn") ?? "null")?.systemId).toBe(SystemId.COMMERCIAL_100);
            expect(component.currentView()).toBe(View.ProtocolCustomer);
            expect(sessionStorage.getItem("viewIndex")).toBe(String(ibn.views.indexOf(View.ProtocolCustomer)));
        });

        it("shows the view after the displayed one, even if a view was inserted before it", () => {
            removeViewBeforeDisplayed(View.ProtocolSerialNumbers);
            component.goToNextView();
            expect(component.currentView()).toBe(View.Alerting);
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });

    describe("#goToPreviousView", () => {
        it("shows the view before the displayed one", () => {
            goToView(View.Alerting);
            component.goToPreviousView();
            expect(component.currentView()).toBe(View.ProtocolSerialNumbers);
        });

        it("shows the view before the displayed one, even if a view was inserted before it", () => {
            removeViewBeforeDisplayed(View.Alerting);
            component.goToPreviousView();
            expect(component.currentView()).toBe(View.ProtocolSerialNumbers);
        });

        it("stays on the first view", () => {
            component.goToPreviousView();
            expect(component.currentView()).toBe(View.PreInstallation);
            expect(navigateSpy).not.toHaveBeenCalled();
        });
    });
});
