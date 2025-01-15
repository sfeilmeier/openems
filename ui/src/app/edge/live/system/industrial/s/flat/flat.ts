import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Converter } from "src/app/shared/components/shared/converter";
import { ModalComponent } from "../modal/modal";

@Component({
  selector: "Industrial_S",
  templateUrl: "./flat.html",
  standalone: false,
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
