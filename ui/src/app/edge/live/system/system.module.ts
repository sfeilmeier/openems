import { NgModule } from "@angular/core";

import { Industrial_L } from "./industrial/l/Industrial_L";
import { Industrial_S } from "./industrial/s/Industrial_S";
import { Industrial_Xl } from "./industrial/xl/Industrial_Xl";

@NgModule({
    imports: [
        Industrial_S,
        Industrial_L,
        Industrial_Xl,
    ],
    exports: [
        Industrial_S,
        Industrial_L,
        Industrial_Xl,
    ],
})
export class SystemModule { }
