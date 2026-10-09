import { TranslateService } from "@ngx-translate/core";
import { TestingUtils } from "src/app/shared/components/shared/testing/utils.spec";
import { DocsUtils } from "src/app/shared/utils/docs/docs.utils";
import { environment } from "src/environments";
import { View } from "../shared/enums";
import { EmsType } from "../shared/ibndatatypes";
import { System, SystemId, SystemType } from "../shared/system";
import { InstallationSystem } from "./installation-system";

describe("#InstallationSystem.getSystemManualLink", () => {
    const { HOME, COMMERCIAL } = environment.links.MANUALS.SYSTEM;
    const testCases: { systemId: SystemId; link: string }[] = [
        { systemId: SystemId.FENECON_HOME_10, link: HOME.HOME_10 },
        { systemId: SystemId.FENECON_HOME_20, link: HOME.HOME_20_30 },
        { systemId: SystemId.FENECON_HOME_30, link: HOME.HOME_20_30 },
        { systemId: SystemId.FENECON_HOME_10_GEN_2, link: HOME.HOME_GEN_2 },
        { systemId: SystemId.COMMERCIAL_30_ANSCHLUSS, link: COMMERCIAL.COMMERCIAL_30 },
        { systemId: SystemId.COMMERCIAL_50_GEN_1, link: COMMERCIAL.COMMERCIAL_50_GEN_1 },
        { systemId: SystemId.COMMERCIAL_50_GEN_3, link: COMMERCIAL.COMMERCIAL_50_GEN_3 },
        { systemId: SystemId.COMMERCIAL_92_WITHOUT_CLUSTER, link: COMMERCIAL.COMMERCIAL_92 },
        { systemId: SystemId.COMMERCIAL_92_CLUSTER, link: COMMERCIAL.COMMERCIAL_92_CLUSTER },
        { systemId: SystemId.COMMERCIAL_100, link: COMMERCIAL.COMMERCIAL_100 },
    ];

    testCases.forEach(({ systemId, link }) => {
        it(`should return the manual link in the current docs language for '${systemId}'`, () => {
            const result = InstallationSystem.getSystemManualLink(systemId);
            expect(result).toEqual(DocsUtils.replaceWithCurrentDocsLanguage(link));
            expect(result).not.toContain("{language}");
        });
    });
});

describe("#InstallationSystem.getSystemVariants", () => {
    it("should delegate Home variants to EmsTypeConfig for FENECON_HOME", () => {
        const result = InstallationSystem.getSystemVariants(SystemType.FENECON_HOME, "feh013").map((o) => o.value);
        expect(result).toEqual([
            SystemId.FENECON_HOME_6,
            SystemId.FENECON_HOME_10_GEN_2,
            SystemId.FENECON_HOME_15,
            SystemId.FENECON_HOME_20,
            SystemId.FENECON_HOME_30,
        ]);
    });

    it("should delegate Home variants to EmsTypeConfig for HECKERT_HOME", () => {
        const result = InstallationSystem.getSystemVariants(SystemType.HECKERT_HOME, "feh013").map((o) => o.value);
        expect(result).toEqual(
            InstallationSystem.getSystemVariants(SystemType.FENECON_HOME, "feh013").map((o) => o.value),
        );
    });

    it("should delegate Commercial variants to EmsTypeConfig for COMMERCIAL", () => {
        const result = InstallationSystem.getSystemVariants(SystemType.COMMERCIAL, "fec013").map((o) => o.value);
        expect(result).toEqual([SystemId.COMMERCIAL_92_CLUSTER]);
    });

    it("should not fail for a null emsType (must not require a defined EMS type)", () => {
        const result = InstallationSystem.getSystemVariants(SystemType.COMMERCIAL, null).map((o) => o.value);
        expect(result).toEqual([
            SystemId.COMMERCIAL_30_ANSCHLUSS,
            SystemId.COMMERCIAL_30_NETZTRENNSTELLE,
            SystemId.COMMERCIAL_50_GEN_1,
        ]);
    });
});

describe("#InstallationSystem.getSupportedSystemTypes", () => {
    // The test environment uses a non-Heckert theme, so these tests pin the EmsTypeConfig delegation; the
    // Heckert branch is covered by the theme check inside the function.
    const testCases: { emsType: EmsType; expected: SystemType[] }[] = [
        { emsType: "feh013", expected: [SystemType.FENECON_HOME, SystemType.COMMERCIAL] },
        { emsType: null, expected: [SystemType.FENECON_HOME, SystemType.COMMERCIAL] },
        { emsType: "fho011", expected: [SystemType.FENECON_HOME] },
        { emsType: "fec013", expected: [SystemType.COMMERCIAL] },
    ];

    testCases.forEach(({ emsType, expected }) => {
        it(`should return ${JSON.stringify(expected)} for emsType '${emsType}'`, () => {
            const result = InstallationSystem.getSupportedSystemTypes(emsType).map((option) => option.value);
            expect(result).toEqual(expected);
        });
    });
});

describe("#InstallationSystem.getRippleControlManualLink", () => {
    const { RIPPLE_CONTROL } = environment.links.MANUALS;

    it("should return the Home Gen 2 link for Home Gen 2 systems", () => {
        expect(InstallationSystem.getRippleControlManualLink(SystemId.FENECON_HOME_10_GEN_2)).toBe(
            DocsUtils.replaceWithCurrentDocsLanguage(RIPPLE_CONTROL.HOME_GEN_2),
        );
    });

    it("should return the Home 10 Gen 1 link for other systems", () => {
        expect(InstallationSystem.getRippleControlManualLink(SystemId.FENECON_HOME_10)).toBe(
            DocsUtils.replaceWithCurrentDocsLanguage(RIPPLE_CONTROL.HOME_10_GEN_1),
        );
    });

    it("should return the Home 20/30 link for Home 20 and Home 30 systems", () => {
        expect(InstallationSystem.getRippleControlManualLink(SystemId.FENECON_HOME_20)).toBe(
            DocsUtils.replaceWithCurrentDocsLanguage(RIPPLE_CONTROL.HOME_20_30),
        );
        expect(InstallationSystem.getRippleControlManualLink(SystemId.FENECON_HOME_30)).toBe(
            DocsUtils.replaceWithCurrentDocsLanguage(RIPPLE_CONTROL.HOME_20_30),
        );
    });
});

describe("#InstallationSystem.isHomeSystemVariant", () => {
    it("should return true for a home SystemId", () => {
        expect(InstallationSystem.isHomeSystemVariant(SystemId.FENECON_HOME_10)).toBeTrue();
    });

    it("should return false for a commercial SystemId", () => {
        expect(InstallationSystem.isHomeSystemVariant(SystemId.COMMERCIAL_100)).toBeFalse();
    });
});

/**
 * Regression test for a step-skipping bug: every concrete Home/Commercial system reachable through the unified
 * ConfigurationSystemVariant step must reserve that same view slot (immediately after ConfigurationSystem) in its own
 * `views` array. Without it, navigation index math skips the system's first real configuration step (see
 * Commercial100Ibn / Commercial50Gen3Ibn, which were missing this entry).
 */
describe("#Views reachable via ConfigurationSystemVariant reserve the same view slot", () => {
    let translate: TranslateService;

    beforeEach(async () => {
        const testContext = await TestingUtils.sharedSetup();
        translate = testContext.translate;
    });

    [...System.HOME_SYSTEMS, ...System.COMMERCIAL_SYSTEMS].forEach((systemId) => {
        it(`should place ConfigurationSystemVariant directly after ConfigurationSystem for '${systemId}'`, () => {
            const ibn = System.getSystemObjectFromSystemId(systemId, translate);
            const configurationSystemIndex = ibn.views.indexOf(View.ConfigurationSystem);

            expect(configurationSystemIndex).toBeGreaterThan(-1);
            expect(ibn.views[configurationSystemIndex + 1]).toEqual(View.ConfigurationSystemVariant);
        });
    });
});
