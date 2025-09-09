import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Modal } from "src/app/shared/components/flat/flat";
import { Converter } from "src/app/shared/components/shared/converter";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { ClearTimeOutFailureRequest } from "../../jsonrpc/clearTimeoutFailure";
import { ModalComponent } from "../modal/modal";

@Component({
  selector: "Industrial_S",
  templateUrl: "./flat.html",
  standalone: false,
})
export class FlatComponent extends AbstractFlatWidget {
  protected readonly CONVERT_INDUSTRIAL_STATE = Converter.CONVERT_INDUSTRIAL_STATE(this.translate);

  protected get modalComponent(): Modal {
    return {
      component: ModalComponent,
      componentProps: {
        component: this.component,
      },
    };
  }

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

  protected clear() {
    this.edge.sendRequest(
      this.websocket,
      new ComponentJsonApiRequest({ componentId: this.component.id, payload: new ClearTimeOutFailureRequest() }),
    );
  }
}
