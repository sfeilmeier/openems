import { SystemId, SystemType } from "../shared/system";
import { EmsTypeConfig } from "./ems-type-config";

describe("#EmsTypeConfig.from", () => {
    it("should return a FEH013Config for 'feh013'", () => {
        expect(EmsTypeConfig.from("feh013").emsType).toEqual("feh013");
    });

    it("should return a FHO011Config for 'fho011'", () => {
        expect(EmsTypeConfig.from("fho011").emsType).toEqual("fho011");
    });

    it("should return a FEC011Config for 'fec011'", () => {
        expect(EmsTypeConfig.from("fec011").emsType).toEqual("fec011");
    });

    it("should return a FEC013Config for 'fec013'", () => {
        expect(EmsTypeConfig.from("fec013").emsType).toEqual("fec013");
    });

    it("should return the DefaultEmsConfig for null", () => {
        expect(EmsTypeConfig.from(null).emsType).toBeNull();
    });
});

describe("#EmsTypeConfig.getSupportedSystemTypes", () => {
    const testCases: { emsType: Parameters<typeof EmsTypeConfig.from>[0]; expected: SystemType[] }[] = [
        { emsType: "feh013", expected: [SystemType.FENECON_HOME, SystemType.COMMERCIAL] },
        { emsType: "fho011", expected: [SystemType.FENECON_HOME] },
        { emsType: "fec011", expected: [SystemType.COMMERCIAL] },
        { emsType: "fec013", expected: [SystemType.COMMERCIAL] },
        { emsType: null, expected: [SystemType.FENECON_HOME, SystemType.COMMERCIAL] },
    ];

    testCases.forEach(({ emsType, expected }) => {
        it(`should return ${JSON.stringify(expected)} for emsType '${emsType}'`, () => {
            const result = EmsTypeConfig.from(emsType)
                .getSupportedSystemTypes()
                .map((option) => option.value);
            expect(result).toEqual(expected);
        });
    });
});

describe("#EmsTypeConfig.getHomeVariants", () => {
    const testCases: { emsType: Parameters<typeof EmsTypeConfig.from>[0]; expected: SystemId[] }[] = [
        {
            // Regression test: FEH013 (Gen 2 hardware) must NOT offer FENECON_HOME_10 (Gen 1 model), only fho011/null do.
            emsType: "feh013",
            expected: [
                SystemId.FENECON_HOME_6,
                SystemId.FENECON_HOME_10_GEN_2,
                SystemId.FENECON_HOME_15,
                SystemId.FENECON_HOME_20,
                SystemId.FENECON_HOME_30,
            ],
        },
        { emsType: "fho011", expected: [SystemId.FENECON_HOME_10] },
        { emsType: "fec011", expected: [] },
        { emsType: "fec013", expected: [] },
        {
            emsType: null,
            expected: [
                SystemId.FENECON_HOME_6,
                SystemId.FENECON_HOME_10,
                SystemId.FENECON_HOME_10_GEN_2,
                SystemId.FENECON_HOME_15,
                SystemId.FENECON_HOME_20,
                SystemId.FENECON_HOME_30,
            ],
        },
    ];

    testCases.forEach(({ emsType, expected }) => {
        it(`should return ${JSON.stringify(expected)} for emsType '${emsType}'`, () => {
            const result = EmsTypeConfig.from(emsType)
                .getHomeVariants()
                .map((option) => option.value);
            expect(result).toEqual(expected);
        });
    });
});

describe("#EmsTypeConfig.getCommercialVariants", () => {
    const testCases: { emsType: Parameters<typeof EmsTypeConfig.from>[0]; expected: SystemId[] }[] = [
        {
            emsType: "feh013",
            expected: [SystemId.COMMERCIAL_92_WITHOUT_CLUSTER, SystemId.COMMERCIAL_50_GEN_3, SystemId.COMMERCIAL_100],
        },
        { emsType: "fho011", expected: [] },
        {
            emsType: "fec011",
            expected: [
                SystemId.COMMERCIAL_30_ANSCHLUSS,
                SystemId.COMMERCIAL_30_NETZTRENNSTELLE,
                SystemId.COMMERCIAL_50_GEN_1,
            ],
        },
        { emsType: "fec013", expected: [SystemId.COMMERCIAL_92_CLUSTER] },
        {
            emsType: null,
            expected: [
                SystemId.COMMERCIAL_30_ANSCHLUSS,
                SystemId.COMMERCIAL_30_NETZTRENNSTELLE,
                SystemId.COMMERCIAL_50_GEN_1,
            ],
        },
    ];

    testCases.forEach(({ emsType, expected }) => {
        it(`should return ${JSON.stringify(expected)} for emsType '${emsType}'`, () => {
            const result = EmsTypeConfig.from(emsType)
                .getCommercialVariants()
                .map((option) => option.value);
            expect(result).toEqual(expected);
        });
    });
});
