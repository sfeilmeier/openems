import { Component, Input } from "@angular/core";
import { Converter } from "src/app/shared/components/shared/converter";

@Component({
    selector: "oe-energy-journey-constant-line",
    template: `
            @if (category !== null && value !== null) {
              <ion-row>
                <ion-col size="6">
                  <ion-label>
                    {{category}}
                  </ion-label>
                </ion-col>
                <ion-col size="6">
                  <div disabled="true" type="text"
                    [class]="editable ? 'editable' : 'constant'"
                    style="padding-left: 5%; text-align: center;">
                    {{value | converter: converter}}
                  </div>
                </ion-col>
              </ion-row>
            }
            `,
    styles: [
        `
        :host{
            ion-label{
                font-family:  var(--ion-font-family) !important;
            }
        }
        `,
    ],
    styleUrl: "./constant-line.scss",
    standalone: false,
})
export class EnergyJourneyConstantLineComponent {

    @Input() public category: string | null = null;
    @Input() public value: any | null = null;
    @Input() public converter: Converter = Converter.TO_STRING;
    @Input() public editable: boolean = false;
}
