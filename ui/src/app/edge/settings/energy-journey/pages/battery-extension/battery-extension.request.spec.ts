import { PossibleBatteryExtensionRequest } from "./battery-extension.request";

describe("PossibleBatteryExtensionRequest", () => {
    it("serializes the dates and electricity price in params", () => {
        const request = new PossibleBatteryExtensionRequest(new Date(2026, 0, 1), new Date(2026, 0, 31), 0.3);
        const serialized = JSON.parse(JSON.stringify(request));

        expect(serialized.method).toBe("possibleBatteryCapacityExtension");
        expect(serialized.params).toEqual({
            fromDate: "2026-01-01",
            toDate: "2026-01-31",
            electricityPrice: 0.3,
        });
    });

    it("does not leak constructor parameters onto the request", () => {
        const request = new PossibleBatteryExtensionRequest(new Date(2026, 0, 1), new Date(2026, 0, 31), 0.3);
        const serialized = JSON.parse(JSON.stringify(request));

        expect(Object.prototype.hasOwnProperty.call(request, "fromDate")).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(request, "toDate")).toBe(false);
        expect(Object.prototype.hasOwnProperty.call(request, "electricityPrice")).toBe(false);
        expect(serialized.fromDate).toBeUndefined();
        expect(serialized.toDate).toBeUndefined();
        expect(serialized.electricityPrice).toBeUndefined();
    });
});
