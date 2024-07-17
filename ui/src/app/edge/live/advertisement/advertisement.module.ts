import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';

import { AdvertisementComponent } from './advertisement.component';
import { AwardWinningComponent } from './awards/awards';

@NgModule({
    imports: [
        SharedModule,
    ],
    declarations: [
        AdvertisementComponent,
        AwardWinningComponent,
    ],
    exports: [
        AdvertisementComponent,
        AwardWinningComponent,
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AdvertisementModule { }
