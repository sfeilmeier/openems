import { DummyConfig } from "src/app/shared/components/edge/edgeconfig.spec";
import { Country } from "src/app/shared/type/country";
import { View } from "./enums";
import { IbnUtils } from "./ibn.utils";
import { ViewUtils } from "./view.utils";

describe("#Ibn-Utils", () => {
    const prefix = "FHA";

    const testCases = [
        { input: "FHA12345", prefix, expected: "12345" }, // Standard case
        { input: "12345FHA", prefix, expected: "12345FHA" }, // Prefix is in the middle, should return as is
        { input: "XYZ789", prefix, expected: "XYZ789" }, // No prefix at all, return as is
        { input: "FHA", prefix, expected: "" }, // Only prefix, should return empty string
        { input: "", prefix, expected: "" }, // Empty input should return empty
        { input: "FHA123FHA789", prefix, expected: "123FHA789" }, // Only first "FHA" should be removed
        { input: "ABC123", prefix: "ABC", expected: "123" }, // Works with different prefixes
        { input: "123ABC", prefix: "ABC", expected: "123ABC" }, // "ABC" is at the end, return as is
    ];

    testCases.forEach(({ input, prefix, expected }) => {
        it(`#removePrefix should correctly process '${input}' with prefix '${prefix}'`, () => {
            expect(IbnUtils.removePrefix(input, prefix)).toEqual(expected);
        });
    });
});

describe("#View-Utils", () => {
    let views: View[];

    beforeEach(() => {
        views = [
            View.Completion,
            View.ConfigurationSystem,
            View.PreInstallationUpdate,
        ];
    });

    describe("#remove", () => {
        it("should remove a view if it exists", () => {
            ViewUtils.remove(views, View.PreInstallationUpdate);
            expect(views).not.toContain(View.PreInstallationUpdate);
        });

        it("should call action callback when removing", () => {
            let wasCalled = false;
            ViewUtils.remove(views, View.PreInstallationUpdate, () => { wasCalled = true; });
            expect(wasCalled).toBeTrue();
        });

        it("should do nothing if view does not exist", () => {
            const initial = views;
            ViewUtils.remove(views, View.ProtocolPv);
            expect(views).toEqual(initial);
        });
    });

    describe("#add", () => {
        it("should add a view if it does not exist", () => {
            ViewUtils.add(views, View.ProtocolInstaller, 1);
            expect(views[1]).toBe(View.ProtocolInstaller);
        });

        it("should not add a view if it already exists", () => {
            const initial = views;
            ViewUtils.add(views, View.Completion, 0);
            expect(views).toEqual(initial);
        });

        it("should call action callback when adding", () => {
            let wasCalled = false;
            ViewUtils.add(views, View.ProtocolCustomer, 2, () => { wasCalled = true; });
            expect(wasCalled).toBeTrue();
        });
    });

    describe("#exists", () => {
        it("should return true if view exists", () => {
            expect(ViewUtils.exists(views, View.Completion)).toBeTrue();
        });

        it("should return false if view does not exist", () => {
            expect(ViewUtils.exists(views, View.ProtocolSystem)).toBeFalse();
        });
    });

    describe("#handleViewPresence", () => {
        const location = Country.GERMANY;
        const targetCountry = Country.GERMANY;
        const viewToToggle = View.ConfigurationSystemVariant;
        const insertIndex = 1;

        it("should add view when location matches target and view is missing", () => {
            ViewUtils.handleViewPresence({
                location,
                targetCountry,
                views,
                viewToToggle,
                insertIndex,
            });

            expect(views[1]).toBe(View.ConfigurationSystemVariant);
        });

        it("should not add view again if already present", () => {
            views.push(viewToToggle);
            const initialLength = views.length;

            ViewUtils.handleViewPresence({
                location,
                targetCountry,
                views,
                viewToToggle,
                insertIndex,
            });

            expect(views.length).toBe(initialLength);
        });

        it("should remove view and call shouldClear when location does not match", () => {
            views.push(viewToToggle);

            let wasCalled = false;
            ViewUtils.handleViewPresence({
                location: Country.AUSTRIA,
                targetCountry,
                views,
                viewToToggle,
                insertIndex,
                shouldClear: () => {
                    wasCalled = true;
                },
            });

            expect(views).not.toContain(viewToToggle);
            expect(wasCalled).toBeTrue();
        });

        it("should call shouldSet when view is added", () => {
            let wasCalled = false;

            ViewUtils.handleViewPresence({
                location,
                targetCountry,
                views,
                viewToToggle,
                insertIndex,
                shouldSet: () => {
                    wasCalled = true;
                },
            });

            expect(views).toContain(viewToToggle);
            expect(wasCalled).toBeTrue();
        });
    });

    describe("#handlePreinstallationUpdate", () => {
        it("should remove PreInstallationUpdate if version is too old", () => {
            const edge = DummyConfig.dummyEdge({ version: "2018.10.1" });
            ViewUtils.handlePreinstallationUpdate(views, edge);
            expect(views).not.toContain(View.PreInstallationUpdate);
        });

        it("should keep PreInstallationUpdate if version is sufficient", () => {
            const edge = DummyConfig.dummyEdge({ version: "2024.10.1" });
            ViewUtils.handlePreinstallationUpdate(views, edge);
            expect(views).toContain(View.PreInstallationUpdate);
        });

        it("should do nothing if edge is null", () => {
            const initial = views;
            ViewUtils.handlePreinstallationUpdate(views, null);
            expect(views).toEqual(initial);
        });
    });
});
