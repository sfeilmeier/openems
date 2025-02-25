import { Directive, ElementRef, HostListener } from "@angular/core";
import { IonInput } from "@ionic/angular";

@Directive({
    selector: "[oeKeyMask]",
    standalone: true,
})
export class KeyMaskDirective {
    constructor(private el: ElementRef) { }

    @HostListener("input", ["$event"])
    async onInput(event: KeyboardEvent) {
        const ionInput = this.el.nativeElement as IonInput;
        const nativeInput = await ionInput.getInputElement();
        this.formatInput(nativeInput);
    }

    private formatInput(input: HTMLInputElement) {
        // Remove spaces and enforce a character limit
        let trimmed = input.value.replace(/\s+/g, "");

        if (trimmed.length > 19) {
            trimmed = trimmed.substr(0, 19);
        }

        const hasDashAsLastChar = trimmed.substr(trimmed.length - 1, 1) === "-";
        trimmed = trimmed.replace(/-/g, "");

        // Split into groups of 4
        const groups = [];
        groups.push(trimmed.substr(0, 4));
        if (trimmed.substr(4, 4) !== "") {
            groups.push(trimmed.substr(4, 4));
        }
        if (trimmed.substr(8, 4) !== "") {
            groups.push(trimmed.substr(8, 4));
        }
        if (trimmed.substr(12, 4) !== "") {
            groups.push(trimmed.substr(12, 4));
        }

        // Join groups with dashes and enforce uppercase
        let result = groups.join("-").toUpperCase();
        if (hasDashAsLastChar) {
            result += "-";
        }
        input.value = result;
        input.dispatchEvent(new Event("input"));
    }
}
