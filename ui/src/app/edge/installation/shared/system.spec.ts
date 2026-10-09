import { TranslateService } from "@ngx-translate/core";
import { TestingUtils } from "src/app/shared/components/shared/testing/utils.spec";
import { Commercial100Ibn } from "../installation-systems/commercial/commercial-100/commercial-100";
import { Commercial30AnschlussIbn } from "../installation-systems/commercial/commercial-30/commercial30-anschluss";
import { Commercial30NetztrennIbn } from "../installation-systems/commercial/commercial-30/commercial30-netztrenn";
import { Commercial50Gen1Ibn } from "../installation-systems/commercial/commercial-50/commercial-50-gen1";
import { Commercial50Gen3Ibn } from "../installation-systems/commercial/commercial-50/commercial-50-gen3";
import { Commercial92Ibn } from "../installation-systems/commercial/commercial-92/commercial92";
import { Commercial92ClusterIbn } from "../installation-systems/commercial/commercial-92/commercial92-cluster";
import { Home10FeneconIbn } from "../installation-systems/home/home-10";
import { Home10Gen2FeneconIbn } from "../installation-systems/home/home-10-gen2";
import { Home10HeckertIbn } from "../installation-systems/home/home-10-heckert";
import { Home15Gen2FeneconIbn } from "../installation-systems/home/home-15-gen2";
import { Home20FeneconIbn } from "../installation-systems/home/home-20";
import { Home30FeneconIbn } from "../installation-systems/home/home-30";
import { Home6Gen2FeneconIbn } from "../installation-systems/home/home-6-gen2";
import { System, SystemId, SystemType } from "./system";

type IbnClass = new (...args: any[]) => unknown;

/**
 * Verifies that the given factory creates an instance of the expected class for every test case and that all keys are
 * covered by the test cases.
 */
function testIbnFactory<T extends string>(
    keyName: string,
    allKeys: T[],
    testCases: { key: T; expectedClass: IbnClass }[],
    createIbn: (key: T, translate: TranslateService) => unknown,
): void {
    let translate: TranslateService;

    beforeEach(async () => {
        const testContext = await TestingUtils.sharedSetup();
        translate = testContext.translate;
    });

    testCases.forEach(({ key, expectedClass }) => {
        it(`should return an instance of ${expectedClass.name} for ${keyName} '${key}'`, () => {
            expect(createIbn(key, translate)).toBeInstanceOf(expectedClass);
        });
    });

    it(`should cover all ${keyName} values`, () => {
        const coveredKeys = new Set(testCases.map((tc) => tc.key));
        allKeys.forEach((key) => {
            expect(coveredKeys.has(key)).withContext(`${keyName} '${key}' is not covered by any test case`).toBeTrue();
        });
    });
}

describe("#System.getSystemObjectFromSystemId", () => {
    testIbnFactory(
        "SystemId",
        Object.values(SystemId),
        [
            { key: SystemId.FENECON_HOME_10, expectedClass: Home10FeneconIbn },
            { key: SystemId.FENECON_HOME_10_GEN_2, expectedClass: Home10Gen2FeneconIbn },
            { key: SystemId.FENECON_HOME_6, expectedClass: Home6Gen2FeneconIbn },
            { key: SystemId.FENECON_HOME_15, expectedClass: Home15Gen2FeneconIbn },
            { key: SystemId.FENECON_HOME_20, expectedClass: Home20FeneconIbn },
            { key: SystemId.FENECON_HOME_30, expectedClass: Home30FeneconIbn },
            { key: SystemId.HECKERT_HOME_10, expectedClass: Home10HeckertIbn },
            { key: SystemId.COMMERCIAL_30_ANSCHLUSS, expectedClass: Commercial30AnschlussIbn },
            { key: SystemId.COMMERCIAL_30_NETZTRENNSTELLE, expectedClass: Commercial30NetztrennIbn },
            { key: SystemId.COMMERCIAL_50_GEN_1, expectedClass: Commercial50Gen1Ibn },
            { key: SystemId.COMMERCIAL_50_GEN_3, expectedClass: Commercial50Gen3Ibn },
            { key: SystemId.COMMERCIAL_92_WITHOUT_CLUSTER, expectedClass: Commercial92Ibn },
            { key: SystemId.COMMERCIAL_92_CLUSTER, expectedClass: Commercial92ClusterIbn },
            { key: SystemId.COMMERCIAL_100, expectedClass: Commercial100Ibn },
        ],
        (systemId, translate) => System.getSystemObjectFromSystemId(systemId, translate),
    );
});

describe("#System.isKnownSystemId", () => {
    it("should return true for every SystemId", () => {
        Object.values(SystemId).forEach((systemId) => {
            expect(System.isKnownSystemId(systemId)).withContext(`unknown system id '${systemId}'`).toBeTrue();
        });
    });

    it("should return false for an unknown id (e.g. stale session data)", () => {
        expect(System.isKnownSystemId("Unknown System")).toBeFalse();
    });
});

describe("#System.getSystemObjectFromSystemType", () => {
    testIbnFactory(
        "SystemType",
        Object.values(SystemType),
        [
            { key: SystemType.FENECON_HOME, expectedClass: Home10FeneconIbn },
            { key: SystemType.HECKERT_HOME, expectedClass: Home10HeckertIbn },
            { key: SystemType.COMMERCIAL, expectedClass: Commercial92Ibn },
        ],
        (systemType, translate) => System.getSystemObjectFromSystemType(systemType, translate),
    );
});
