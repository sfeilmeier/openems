import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AbstractModal } from "src/app/shared/components/modal/abstractModal";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { EdgePermission } from "src/app/shared/shared";
import { ClearErrorRequest } from "../../jsonrpc/clearErrorRequest";
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

    protected systemErrorAcknowledge() {
        if (this.edge == null || this.websocket == null || this.component == null) {
            return;
        }
        this.edge.sendRequest(
            this.websocket,
            new ComponentJsonApiRequest({ componentId: this.component.id, payload: new SystemErrorAcknowledge() }),
        );
    }

    protected clearCoolingUnitErrors() {
        if (this.edge == null || this.websocket == null || this.component == null) {
            return;
        }
        this.edge.sendRequest(
            this.websocket,
            new ComponentJsonApiRequest({ componentId: this.component.id, payload: new ClearErrorRequest() }),
        );
    }

}
