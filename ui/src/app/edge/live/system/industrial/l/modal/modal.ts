// @ts-strict-ignore
import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AbstractModal } from "src/app/shared/components/modal/abstractModal";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { BmsHardResetRequest } from "../../jsonrpc/bmsHardReset";

@Component({
    templateUrl: "./modal.html",
    standalone: false,
})
export class ModalComponent extends AbstractModal {

    protected override getFormGroup(): FormGroup {
        return this.formBuilder.group({
            startStop: new FormControl(this.component?.properties.startStop),
        });
    }

    protected reset() {
        this.edge.sendRequest(
            this.websocket,
            new ComponentJsonApiRequest({ componentId: this.component.id, payload: new BmsHardResetRequest() }),
        );
    }
}
