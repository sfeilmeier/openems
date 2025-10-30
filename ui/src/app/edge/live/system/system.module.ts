import { NgModule } from "@angular/core";

import { Industrial_L } from "./industrial/l/Industrial_L";
import { Industrial_S } from "./industrial/s/Industrial_S";

@NgModule({
    imports: [
        Industrial_S,
        Industrial_L,
    ],
    exports: [
        Industrial_S,
        Industrial_L,
    ],
})
export class SystemModule { }
