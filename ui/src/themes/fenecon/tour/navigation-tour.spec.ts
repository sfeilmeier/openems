import { TestBed } from "@angular/core/testing";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { compareVersions, validate } from "compare-versions";
import { Service } from "src/app/shared/service/service";
import { TourStep } from "src/app/shared/tour/tour-step";
import { TutorialTargetId } from "src/app/shared/tour/tutorial-target-id";
import { Role } from "src/app/shared/type/role";
import { version as uiVersion } from "../../../../package.json";
import de from "./i18n/de.json";
import { FeneconNavigationTour } from "./navigation-tour";

describe("FeneconNavigationTour", () => {
    let currentEdge: { roleIsAtLeast: (role: Role) => boolean } | null;
    let tour: FeneconNavigationTour;

    beforeEach(() => {
        currentEdge = { roleIsAtLeast: (role) => role === Role.OWNER };
        TestBed.configureTestingModule({
            imports: [TranslateModule.forRoot()],
            providers: [FeneconNavigationTour, { provide: Service, useValue: { currentEdge: () => currentEdge } }],
        });
        tour = TestBed.inject(FeneconNavigationTour);
    });

    function getAllSteps(): TourStep[][] {
        return [tour.getDesktopSteps(), tour.getMobileSteps()];
    }

    function getStepIds(): string[][] {
        return getAllSteps().map((steps) => steps.map((step) => step.id));
    }

    it("registers the texts of its steps", () => {
        TestBed.inject(TranslateService).use("de");

        expect(tour.getDesktopSteps()[0]?.title).toBe(de.NAVIGATION_TOUR.WELCOME);
    });

    it("includes the alerting step for owners", () => {
        for (const stepIds of getStepIds()) {
            expect(stepIds).toContain("alerting");
        }
    });

    it("omits the alerting step for users below the owner role", () => {
        currentEdge = { roleIsAtLeast: () => false };

        for (const stepIds of getStepIds()) {
            expect(stepIds).not.toContain("alerting");
        }
    });

    it("omits the alerting step while no edge is selected", () => {
        currentEdge = null;

        for (const stepIds of getStepIds()) {
            expect(stepIds).not.toContain("alerting");
        }
    });

    it("uses unique step ids", () => {
        for (const stepIds of getStepIds()) {
            expect(new Set(stepIds).size).toBe(stepIds.length);
        }
    });

    it("uses step versions that are not newer than the UI version", () => {
        // A newer step version would restart the tour in every session, as the stored UI version stays older
        const [releaseVersion] = uiVersion.split("-");

        for (const step of getAllSteps().flat()) {
            expect(validate(step.version)).withContext(step.id).toBe(true);
            expect(compareVersions(step.version, releaseVersion)).withContext(step.id).toBeLessThanOrEqual(0);
        }
    });

    it("explains the history export in its own desktop step after the history", () => {
        const steps = tour.getDesktopSteps();
        const historyIndex = steps.findIndex((step) => step.id === "energy-journey-history");
        const exportStep = steps[historyIndex + 1];

        expect(historyIndex).toBeGreaterThanOrEqual(0);
        expect(exportStep?.id).toBe("history-export");
        expect(exportStep?.targets).toEqual([{ id: TutorialTargetId.HISTORY_EXPORT }]);
    });
});
