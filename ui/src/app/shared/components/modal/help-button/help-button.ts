// @ts-strict-ignore
import { Component, Input } from "@angular/core";
import { Service } from "src/app/shared/shared";
import { environment } from 'src/environments';

@Component({
    selector: 'oe-help-button',
    templateUrl: './help-button.html',
})
export class HelpButtonComponent {

    protected link: string | null = null;

    constructor(private service: Service) { }

    @Input() set key(key: string) {
        const keys: string[] = key.split(".");

        // If at most one key
        if (keys.length <= 1) {
            this.link = environment.docsUrlPrefix.replace("{language}", this.service.getDocsLang())
                + environment.links[key];
            return;
        }

        this.link = this.findInnerMostKey(keys);
    }

    /**
     * Finds the inner most key of the {@link environment.links links}
     *
     * @param keys the keys of the nested object
     * @returns a string if all keys are continuously matching the object keys
     */
    private findInnerMostKey(keys: string[]): string | null {
        let currentValue = environment.links;
        for (const key of keys) {
            if (!(key in currentValue)) {
                console.error("Key [" + key + "] not found in Environment Links");
                return null;
            }
            currentValue = currentValue[key];
        }

        return currentValue.toString();
    }
}
