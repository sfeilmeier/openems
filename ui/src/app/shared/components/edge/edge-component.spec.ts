import { EvseChargepoint, P30KebaUdp } from "src/app/edge/live/Controller/Evse/shared/evse-chargepoint";
import { EdgeConfig } from "./edgeconfig";
import { DummyConfig } from "./edgeconfig.spec";

describe("EdgeComponent", () => {
    it("copies components using the independent base class", () => {
        const config = DummyConfig.from(DummyConfig.Component.EVSE_CHARGEPOINT_KEBA_UDP("chargePoint0"));
        const source = config.getComponent("chargePoint0");
        const copy = EdgeConfig.Component.of(source);

        expect(copy).toBeInstanceOf(EdgeConfig.Component);
        expect(copy).not.toBe(source);
        expect(copy?.properties).toBe(source.properties);
        expect(EdgeConfig.Component.of(null)).toBeNull();
    });

    it("initializes EVSE subclasses independently of EdgeConfig", () => {
        const config = DummyConfig.from(DummyConfig.Component.EVSE_CHARGEPOINT_KEBA_UDP("chargePoint0"));
        const source = config.getComponent("chargePoint0");
        const chargePoint = EvseChargepoint.getEvseChargepoint(source);

        expect(chargePoint).toBeInstanceOf(P30KebaUdp);
        expect(chargePoint?.component).toBeInstanceOf(EdgeConfig.Component);
        expect(chargePoint?.component.id).toBe(source.id);
        expect(chargePoint?.component.properties).toBe(source.properties);
    });
});
