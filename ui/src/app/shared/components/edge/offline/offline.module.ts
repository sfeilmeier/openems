import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { IonicModule } from "@ionic/angular";
import { TranslateModule } from "@ngx-translate/core";
import { OfflineComponent } from "./offline.component";
import { ManualComponent } from "./producttype/default";
import { Home10ManualComponent } from "./producttype/home-10";
import { Home2030ManualComponent } from "./producttype/home-20-30";

@NgModule({
    imports: [
        BrowserModule,
        IonicModule,
        TranslateModule,
    ],
    declarations: [
        ManualComponent,
        Home10ManualComponent,
        Home2030ManualComponent,
        OfflineComponent,
    ],
    exports: [
        ManualComponent,
        Home10ManualComponent,
        Home2030ManualComponent,
        OfflineComponent,
    ],
})
export class EdgeOfflineModule { }
