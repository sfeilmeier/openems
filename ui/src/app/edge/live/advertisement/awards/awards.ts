import { Component } from "@angular/core";

@Component({
  selector: 'winning-two-awards',
  template: `
    <ion-grid style="font-size: small; text-align: center; width: 100%; cursor: pointer;">
      <ion-row>
          <ion-text class="full_width">
              Kürzlich hatten wir die Ehre, gleich zwei Auszeichnungen am selben Abend zu erhalten: Neben der Trophäe
              Innovator des Jahres 2024 durften wir auch den Bayerischen Mittelstandspreis 2024 entgegennehmen. <br>
              <hr>
              Wir sind sehr dankbar, dass unsere Arbeit auf diese Weise gesehen und ausgezeichnet wird!
              <hr>
              Erfahren Sie mehr im <a href="https://youtu.be/DJOzofSPbpg?feature=shared" target="_blank">YouTube-Video</a>
              und auf unserer <a href="https://fenecon.de/presse/" target="_blank">Website</a>.
          </ion-text>
      </ion-row>
    </ion-grid>
  `,
})
export class AwardWinningComponent { }
