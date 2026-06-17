import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ModalModule } from "src/app/shared/components/modal/modal.module";
import { SharedModule } from "src/app/shared/shared.module";
import { FlatComponent } from "./flat/flat";
import { ModalComponent } from "./modal/modal";
import { SystemIndustrialLComponent } from "./new-navigation/new-navigation";

@NgModule({
    imports: [
        BrowserModule,
        SharedModule,
        ModalModule,
        SystemIndustrialLComponent,
    ],
    declarations: [FlatComponent, ModalComponent],
    exports: [FlatComponent, ModalComponent],
})
export class Industrial_L {}
