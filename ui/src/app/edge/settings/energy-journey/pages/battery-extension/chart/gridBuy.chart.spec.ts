import { XAxisType } from "src/app/shared/components/chart/chart.constants";
import { DummyConfig } from "src/app/shared/components/edge/edgeconfig.spec";
import { OeChartTester } from "src/app/shared/components/shared/testing/tester";
import { TestContext, TestingUtils } from "src/app/shared/components/shared/testing/utils.spec";
import { QueryHistoricTimeseriesEnergyPerPeriodResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyPerPeriodResponse";
import { QueryHistoricTimeseriesEnergyResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyResponse";
import { SimulationResult } from "../battery-extension.module";
import { GridBuyChartComponent } from "./gridBuy.chart";

describe("Battery extension grid-buy chart", () => {
    let testContext: TestContext;

    beforeEach(async () => {
        testContext = await TestingUtils.sharedSetup();
        testContext.translate.use("en");
    });

    function getValues(simulationData: SimulationResult["simulationData"]) {
        const config = DummyConfig.convertDummyEdgeConfigToRealEdgeConfig(DummyConfig.from());
        const view = OeChartTester.apply(
            GridBuyChartComponent.getChartData(simulationData, testContext.translate),
            "bar",
            {
                energyChannelWithValues: new QueryHistoricTimeseriesEnergyResponse("0", { data: {} }),
                energyPerPeriodChannelWithValues: new QueryHistoricTimeseriesEnergyPerPeriodResponse("0", {
                    timestamps: ["2026-01-01T00:00:00Z"],
                    data: { "_sum/GridBuyActiveEnergy": [1000] },
                }),
            },
            testContext,
            config,
            XAxisType.NUMBER,
        );
        return view.datasets.data.map((dataset) => dataset.value);
    }

    it("shows savings relative to the first simulation and omits the baseline", () => {
        const simulationData: SimulationResult["simulationData"] = [1000, 800, 650].map((gridBuy, index) => ({
            numberOfModules: 4 + index,
            gridBuy: gridBuy,
            gridBuyCosts: gridBuy * 0.3,
            kWPeak: 10,
            capacity: 10 + index * 2.5,
        }));

        expect(TestingUtils.removeFunctions(getValues(simulationData))).toEqual(
            TestingUtils.removeFunctions([[200, 350]]),
        );
    });

    it("produces no savings values for empty simulation data", () => {
        expect(TestingUtils.removeFunctions(getValues([]))).toEqual(TestingUtils.removeFunctions([[]]));
    });
});
