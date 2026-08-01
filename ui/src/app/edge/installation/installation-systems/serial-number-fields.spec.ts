import { FormlyFieldConfig } from "@ngx-formly/core";
import { TestContext, TestingUtils } from "../../../shared/components/shared/testing/utils.spec";
import { Category } from "../shared/category";
import { AbstractCommercialGen3 } from "./commercial/abstract-commercial-gen3";
import { AbstractHomeIbn } from "./home/abstract-home";

export class DummyHomeIbn extends AbstractHomeIbn {
    public override appId: string = "home";
    public override appAlias: string = "Home";
    public override maxNumberOfTowers = 1;
    public override minNumberOfTowers = 1;
    public override maxNumberOfModulesPerTower = 10;
    public override minNumberOfModulesPerTower = 1;
    public override emsBoxPrefix = "FEF";
    public override parallelBoxPrefix = "FCP";
    public override isDoubleSocketValid = true;
    public override serialNumbers: any = {
        doubleSocket: {
            label: "Double Socket Label",
            isEnabled: [[true, false]], // Mock data for slaveIndex 0, tower 0 and 1
        },
    };
    public override warrantyLink = 0 as any;
    public override mppt: any = {};
    public override emsBoxLabel = Category.EMS_BOX_LABEL_HOME;
    public override maxNumberOfPvStrings = 10;
    public override maxNumberOfMppt = 5;
    public override defaultEnergyFlowMeter = "" as any;
    protected override readonly mpptImagePaths: Record<number, string | null> = {};

    public override getAppProperties(): any {
        return null;
    }
    public override getMpptLabel(index: number): string {
        return `MPPT ${index}`;
    }
}

export class DummyCommercialGen3Ibn extends AbstractCommercialGen3 {
    public override appId: string = "commercial-gen3";
    public override appAlias: string = "Commercial Gen3";
    public override mpptImagePaths: Record<number, string | null> = {};
    public override isDoubleSocketValid = true;
}

describe("Serial Number Field Generation", () => {
    let homeIbn: DummyHomeIbn;
    let commercialIbn: DummyCommercialGen3Ibn;
    let TEST_CONTEXT: TestContext;

    beforeEach(async () => {
        TEST_CONTEXT = await TestingUtils.sharedSetup();
        const translate = TEST_CONTEXT.translate;
        homeIbn = new DummyHomeIbn([], translate);
        commercialIbn = new DummyCommercialGen3Ibn([], 8, translate);

        // Mock sessionStorage to prevent errors when getting emsBoxSerialNumber
        spyOn(window.sessionStorage, "getItem").and.returnValue("FEF1234567");
    });

    describe("#getTowerHeadFields (AbstractHomeIbn)", () => {
        const testCases = [
            { towerNr: 0, expectedKeys: ["batteryInverter", "emsBox"], expectedPrefix: "FEF" },
            { towerNr: 1, expectedKeys: ["parallelBox"], expectedPrefix: "FCP" },
            { towerNr: 2, expectedKeys: ["extensionBox"], expectedPrefix: "FHE" },
            { towerNr: 5, expectedKeys: ["extensionBox"], expectedPrefix: "FHE" },
        ];

        testCases.forEach(({ towerNr, expectedKeys, expectedPrefix }) => {
            it(`should return [${expectedKeys.join(", ")}] for Home Tower ${towerNr}`, () => {
                const fields = (homeIbn as any).getTowerHeadFields(towerNr) as FormlyFieldConfig[];

                const keys = fields.map((f) => f.key);
                expect(keys).toEqual(expectedKeys);

                const lastField = fields[fields.length - 1];
                expect(lastField.templateOptions?.prefix).toEqual(expectedPrefix);
            });
        });
    });

    describe("#getTowerHeadFields (AbstractCommercialGen3)", () => {
        const testCases = [
            { towerNr: 0, expectedKeys: ["batteryInverter", "parallelBox", "emsBox"] },
            { towerNr: 1, expectedKeys: ["extensionBox"] },
            { towerNr: 2, expectedKeys: ["extensionBox"] },
            { towerNr: 5, expectedKeys: ["extensionBox"] },
        ];

        testCases.forEach(({ towerNr, expectedKeys }) => {
            it(`should return [${expectedKeys.join(", ")}] for Commercial Tower ${towerNr}`, () => {
                const fields = (commercialIbn as any).getTowerHeadFields(towerNr) as FormlyFieldConfig[];
                const keys = fields.map((f) => f.key);
                expect(keys).toEqual(expectedKeys);

                if (towerNr > 0) {
                    expect(fields[0].templateOptions?.prefix).toEqual("FEE");
                }
            });
        });
    });

    describe("#getSerialNumberFields (Template Method Integration)", () => {
        const testCases = [
            {
                description: "Home Tower 0 with 2 modules",
                towerNr: 0,
                modules: 2,
                slaveIndex: 0,
                expectedLength: 2 + 1 + 2, // 2 Head (Inv, EMS) + 1 BMS + 2 Modules
                expectedModuleKeys: ["module0", "module1"],
            },
            {
                description: "Home Tower 1 with 3 modules",
                towerNr: 1,
                modules: 3,
                slaveIndex: 0,
                expectedLength: 1 + 1 + 3, // 1 Head (Parallel) + 1 BMS + 3 Modules
                expectedModuleKeys: ["module0", "module1", "module2"],
            },
        ];

        testCases.forEach(({ description, towerNr, modules, slaveIndex, expectedLength, expectedModuleKeys }) => {
            it(`should generate correct total fields for ${description}`, () => {
                const fields = homeIbn.getSerialNumberFields(towerNr, modules, slaveIndex);

                // Verify total length
                expect(fields.length).toEqual(expectedLength);

                // Verify the BMS box exists
                const bmsField = fields.find((f) => f.key === "bmsBox");
                expect(bmsField).toBeDefined();
                expect(bmsField?.templateOptions?.checkbox).toBeDefined();

                // Verify Modules are generated correctly
                const moduleKeys = fields.filter((f) => (f.key as string).startsWith("module")).map((f) => f.key);
                expect(moduleKeys).toEqual(expectedModuleKeys);
            });
        });
    });
});
