import { NgModule } from "@angular/core";

import { ChannelThreshold } from "./ChannelThreshold/channelThreshold.module";
import { GridOptimizeCharge } from "./Ess/GridoptimizedCharge/gridOptimizeCharge.module";
import { TimeOfUseTariff } from "./Ess/TimeOfUseTariff/timeOfUseTariff.module";
import { ModbusTcpApi } from "./ModbusTcpApi/modbusTcpApi.module";

@NgModule({
  imports: [
    ChannelThreshold,
    TimeOfUseTariff,
    ModbusTcpApi,
    GridOptimizeCharge,
  ],
  exports: [
    ChannelThreshold,
    TimeOfUseTariff,
    ModbusTcpApi,
    GridOptimizeCharge,
  ],
})
export class Controller { }
