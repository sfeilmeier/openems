import { Component, Input } from "@angular/core";
import { Converter } from "src/app/shared/components/shared/converter";

@Component({
    selector: "oe-energy-journey-constant-line",
    template: `
            <ion-row *ngIf="category !== null && value !== null">
                <ion-col size="6">
                <ion-label>
                            {{category}}
                </ion-label>
                </ion-col>
                <ion-col size="6">
                    <div disabled="true" type="text"
                        [style.background-color]="editable ? 'rgba(var(--ion-color-primary-rgb), 0.5)':'lightgrey'"
                        style="padding-left: 5%; color: black; text-align: center;">
                        {{value | converter: converter}}
                    </div>
                </ion-col>
            </ion-row>
    `,
    styles: [
        `
        :host{
            ion-label{
                font-family:  var(--ion-font-family) !important;
            }
        }`,
    ],
})
export class EnergyJourneyConstantLineComponent {

    @Input() public category: string | null = null;
    @Input() public value: any | null = null;
    @Input() public converter: Converter = Converter.TO_STRING;
    @Input() public editable: boolean = false;
}
