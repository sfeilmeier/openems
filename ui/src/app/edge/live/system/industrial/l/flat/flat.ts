import { Component } from "@angular/core";
import { ModalComponent } from "../modal/modal";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Converter } from "src/app/shared/components/shared/converter";

@Component({
  selector: 'Industrial_L',
  templateUrl: './flat.html',
})
export class FlatComponent extends AbstractFlatWidget {
  protected readonly CONVERT_INDUSTRIAL_STATE = Converter.CONVERT_INDUSTRIAL_STATE(this.translate);
  async presentModal() {
    if (!this.isInitialized) {
      return;
    }
    const modal = await this.modalController.create({
      component: ModalComponent,
      componentProps: {
        component: this.component,
      },
    });
    return await modal.present();
  }
}
