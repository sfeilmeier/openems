import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { ModalModule } from "src/app/shared/components/modal/modal.module";
import { SharedModule } from "src/app/shared/shared.module";
import { SystemIndustrialMComponent } from "./new-navigation/new-navigation";

@NgModule({
    imports: [
        BrowserModule,
        SharedModule,
        ModalModule,
        SystemIndustrialMComponent,
    ],
})
export class Industrial_M {}
