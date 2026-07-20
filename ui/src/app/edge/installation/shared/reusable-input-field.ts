import { Component, EventEmitter, Input, Output, ViewChild, ViewEncapsulation, ChangeDetectionStrategy, } from "@angular/core";
import { IonicModule, IonInput } from "@ionic/angular";
import { KeyMaskDirective } from "src/app/edge/installation/keymask";

@Component({
    selector: "oe-setup-key-input",
    imports: [IonicModule, KeyMaskDirective],
    template: `
        <table class="full_width ion-text-center">
            <ion-grid>
                <ion-row class="ion-justify-content-center ion-align-items-center">
                    <ion-item class="ion-align-items-center setup-key-input">
                        <ion-input
                            oeKeyMask
                            type="text"
                            [placeholder]="placeholder"
                            (ionInput)="onEnterPressed($event)"
                        >
                        </ion-input>
                    </ion-item>
                </ion-row>
            </ion-grid>
        </table>
    `,
    styles: [
        `
            .setup-key-input {
                --background: var(--ion-color-primary-tint);
                --color: var(--ion-color-text-menu);
                --border-radius: 0.75em;
            }
        `,
    ],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: true,
})
export class SetupKeyComponent {
    @Input() public placeholder: string = "";
    @Output() public submitEvent = new EventEmitter<string>();
    @ViewChild("setupKey", { static: false }) protected setupKey!: IonInput;

    protected onEnterPressed(event: Event) {
        const inputElement = event.target as HTMLInputElement;
        const value = inputElement.value.trim();

        if (value) {
            this.submitEvent.emit(value);
        }
    }
}
