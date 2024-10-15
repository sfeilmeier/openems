import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";

@Component({
    templateUrl: "./modal.html",
})
export class ModalComponent {

    constructor(
        public modalCtrl: ModalController,
    ) { }
}
