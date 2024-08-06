import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { EnergyJourneyComponent } from './energy-journey';
import { BatteryExtensionModule } from './pages/battery-extension/battery-extension.module';

@NgModule({
  imports: [
    SharedModule,
    BatteryExtensionModule,
  ],
  declarations: [
    EnergyJourneyComponent,
  ],
})
export class EnergyJourneyModule { }

export class EnergyJourneyWidget {
  constructor(
    private label: string,
    private slogan: string,
    private description: string,
    private link: string[],
    private buttonText: string,
  ) { }
}
