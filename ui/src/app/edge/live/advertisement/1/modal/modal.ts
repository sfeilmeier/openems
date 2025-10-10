import { Component } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { register } from "swiper/element/bundle";

register();

@Component({
    templateUrl: "./modal.html",
    standalone: false,
})
export class Advert1ModalComponent {
    constructor(
        protected readonly translate: TranslateService,
        protected readonly modalController: ModalController
    ) { }
}
