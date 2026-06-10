import { TestBed } from "@angular/core/testing";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { PlatFormService } from "src/app/platform.service";
import { UserSettings } from "src/app/shared/jsonrpc/shared";
import { UserService } from "src/app/shared/service/user.service";
import { Edge, Service } from "src/app/shared/shared";
import { environment } from "src/environments";
import { WrapUpComponent } from "./wrap-up";

describe("WrapUpComponent", () => {
    let component: WrapUpComponent;
    let modalCtrlSpy: jasmine.SpyObj<ModalController>;
    let serviceSpy: jasmine.SpyObj<Service>;
    let userServiceSpy: jasmine.SpyObj<UserService>;

    beforeEach(() => {
        modalCtrlSpy = jasmine.createSpyObj<ModalController>("ModalController", ["dismiss"]);
        serviceSpy = jasmine.createSpyObj<Service>("Service", ["getCurrentEdge"]);
        userServiceSpy = jasmine.createSpyObj<UserService>("UserService", ["currentUser", "updateUserSettingsWithProperty"]);

        TestBed.configureTestingModule({
            providers: [
                PlatFormService,
                { provide: ModalController, useValue: modalCtrlSpy },
                { provide: Service, useValue: serviceSpy },
                { provide: UserService, useValue: userServiceSpy },
                { provide: TranslateService, useValue: jasmine.createSpyObj<TranslateService>("TranslateService", ["setTranslation"]) },
            ],
        });

        TestBed.runInInjectionContext(() => {
            component = new WrapUpComponent();
        });
    });

    describe("shouldShowPopover", () => {
        it("returns false when annual review popover should not be shown by edge", () => {
            const edgeSpy = jasmine.createSpyObj<Edge>("Edge", ["shouldShowAnnualReviewPopover"], { id: "edge-1" });
            edgeSpy.shouldShowAnnualReviewPopover.and.returnValue(false);

            userServiceSpy.currentUser.and.returnValue({
                getAnnualReviewFromSettings: () => [],
            } as any);

            expect(WrapUpComponent.shouldShowPopover(edgeSpy, userServiceSpy)).toBeFalse();
        });

        it("returns false when edge was already reviewed", () => {
            const edgeSpy = jasmine.createSpyObj<Edge>("Edge", ["shouldShowAnnualReviewPopover"], { id: "edge-1" });
            edgeSpy.shouldShowAnnualReviewPopover.and.returnValue(true);

            userServiceSpy.currentUser.and.returnValue({
                getAnnualReviewFromSettings: () => ["edge-1"],
            } as any);

            expect(WrapUpComponent.shouldShowPopover(edgeSpy, userServiceSpy)).toBeFalse();
        });

        it("honors theme gate when all other conditions are true", () => {
            const edgeSpy = jasmine.createSpyObj<Edge>("Edge", ["shouldShowAnnualReviewPopover"], { id: "edge-1" });
            edgeSpy.shouldShowAnnualReviewPopover.and.returnValue(true);

            userServiceSpy.currentUser.and.returnValue({
                getAnnualReviewFromSettings: () => [],
            } as any);

            const result = WrapUpComponent.shouldShowPopover(edgeSpy, userServiceSpy);

            if (environment.theme === "FENECON") {
                expect(result).toBeTrue();
            } else {
                expect(result).toBeFalse();
            }
        });
    });

    describe("dismiss", () => {
        it("updates annual review settings, writes localStorage and dismisses modal", async () => {
            const currentEdge = { id: "edge-2" } as Edge;
            const currentUser = {
                getAnnualReviewFromSettings: () => ["edge-1", "edge-2"],
            };

            serviceSpy.getCurrentEdge.and.resolveTo(currentEdge);
            userServiceSpy.currentUser.and.returnValue(currentUser as any);
            userServiceSpy.updateUserSettingsWithProperty.and.resolveTo();

            const setItemSpy = spyOn(localStorage, "setItem");

            await (component as any).dismiss();

            expect(serviceSpy.getCurrentEdge).toHaveBeenCalledTimes(1);
            expect(userServiceSpy.updateUserSettingsWithProperty).toHaveBeenCalledOnceWith(UserSettings.ANNUAL_REVIEW, ["edge-1", "edge-2"]);
            expect(setItemSpy).toHaveBeenCalledOnceWith("popover-annual-review-edge-2", "true");
            expect(modalCtrlSpy.dismiss).toHaveBeenCalledTimes(1);
        });
    });
});
