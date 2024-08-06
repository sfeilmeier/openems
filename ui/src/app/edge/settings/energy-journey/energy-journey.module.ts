import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/shared/shared.module';
import { BatteryExtensionModule } from './pages/battery-extension/battery-extension.module';
import { EnergyJourneyComponent } from './energy-journey';

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
