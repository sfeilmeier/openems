import { Component } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AbstractModal } from "src/app/shared/components/modal/abstractModal";

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

}
