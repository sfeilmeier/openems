import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AbstractModal } from "src/app/shared/components/modal/abstractModal";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { EdgePermission } from "src/app/shared/shared";
import { BmsHardResetRequest } from "../../jsonrpc/bmsHardReset";
import { SystemErrorAcknowledge } from "../../jsonrpc/systemErrorAcknowledge";

@Component({
    templateUrl: "./modal.html",
    standalone: false,
})
export class ModalComponent extends AbstractModal {

    protected isAtLeastInstaller: boolean = false;
    protected canSeeSystemErrorAcknowledge: boolean = false;

    public override ngOnInit() {
        super.ngOnInit();
        this.service.getCurrentEdge().then(edge => {
            this.isAtLeastInstaller = edge.roleIsAtLeast(this.Role.INSTALLER);
            this.canSeeSystemErrorAcknowledge = EdgePermission.hasSystemErrorAcknowledge(edge);
        });
    }

    protected override getFormGroup(): FormGroup {
        return this.formBuilder.group({
            startStop: new FormControl(this.component?.properties.startStop),
        });
    }

    protected bmsHardReset(): void {
        if (this.edge && this.websocket && this.component) {
            this.edge.sendRequest(
                this.websocket,
                new ComponentJsonApiRequest({ componentId: this.component?.id, payload: new BmsHardResetRequest() }),
            );
        }
    }

    protected systemErrorAcknowledge(): void {
        if (this.edge && this.websocket && this.component) {
            this.edge.sendRequest(
                this.websocket,
                new ComponentJsonApiRequest({ componentId: this.component?.id, payload: new SystemErrorAcknowledge() }),
            );
        }
    }
}
