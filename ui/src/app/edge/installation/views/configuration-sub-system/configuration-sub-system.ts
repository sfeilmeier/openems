// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectionStrategy } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { EmsType } from "../../shared/ibndatatypes";
import { SubSystemType, System } from "../../shared/system";

@Component({
    selector: ConfigurationSubSystemComponent.SELECTOR,
    templateUrl: "./configuration-sub-system.html",
    changeDetection: ChangeDetectionStrategy.Eager,
    standalone: false,
})
export class ConfigurationSubSystemComponent implements OnInit {
    private static readonly SELECTOR = "configuration-sub-system";

    @Input() public ibn: AbstractIbn;
    @Output() public nextViewEvent = new EventEmitter();
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();

    public form: FormGroup;
    public fields: FormlyFieldConfig[];
    public model;
    private emsType: EmsType = null;

    constructor(private translate: TranslateService) {}

    protected get showNote(): boolean {
        const subSystemType = this.form.controls.subType?.value as SubSystemType | null | undefined;
        return subSystemType != null && subSystemType === SubSystemType.COMMERCIAL_92;
    }

    protected get showManualLink(): boolean {
        const subSystemType = this.form.controls.subType?.value as SubSystemType | null | undefined;
        return subSystemType != null && subSystemType !== SubSystemType.COMMERCIAL_100;
    }

    public ngOnInit() {
        this.form = new FormGroup({});
        this.fields = this.ibn.getSubSystemFields();
        this.emsType = this.ibn.getEmsType();
    }

    public onNextClicked() {
        if (this.form.invalid) {
            return;
        }
        // Sets the ibn object.
        const subSystem: SubSystemType = this.form.controls.subType.value;
        this.ibn = System.getSystemObjectFromSubSystemType(subSystem, this.translate, this.emsType);
        this.ibn.showViewCount = true;

        this.nextViewEvent.emit(this.ibn);
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    /** Redirects to the appropriate url for system manual. */
    protected openManual(): void {
        const subSystem: SubSystemType = this.form.controls.subType.value;
        window.open(System.getSubSystemTypeLink(subSystem, this.emsType));
    }
}
