import { Component } from "@angular/core";
import { AbstractFlatWidget } from "src/app/shared/components/flat/abstract-flat-widget";
import { Modal } from "src/app/shared/components/flat/flat";
import { Converter } from "src/app/shared/components/shared/converter";
import { ModalComponent } from "../modal/modal";

@Component({
    selector: "Industrial_L",
    templateUrl: "./flat.html",
    standalone: false,
})
export class FlatComponent extends AbstractFlatWidget {
    protected readonly CONVERT_INDUSTRIAL_STATE = Converter.CONVERT_INDUSTRIAL_STATE(this.translate);

    protected modalComponent: Modal | null = null;

    protected override afterIsInitialized(): void {
        this.modalComponent = this.getModalComponent();
    }

    protected getModalComponent(): Modal {
        return {
            component: ModalComponent,
            componentProps: {
                component: this.component,
            },
        };
    }
}
