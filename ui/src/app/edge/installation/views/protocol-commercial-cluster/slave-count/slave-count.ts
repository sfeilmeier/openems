// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { TranslateService } from "@ngx-translate/core";
import { Edge } from "src/app/shared/shared";
import { AbstractIbn } from "../../../installation-systems/abstract-ibn";
import { AbstractCommercial92Ibn } from "../../../installation-systems/commercial/commercial-92/abstract-commercial92";

@Component({
    selector: ProtocolCommercialClusterSlaveCountComponent.SELECTOR,
    templateUrl: "./slave-count.html",
    standalone: false,
})
export class ProtocolCommercialClusterSlaveCountComponent implements OnInit {
    private static readonly SELECTOR = "protocol-commercial-slave-count";

    @Input() public ibn: AbstractCommercial92Ibn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

    public form: FormGroup;
    public fields: FormlyFieldConfig[];
    public model;

    constructor(private translate: TranslateService) { }

    public ngOnInit() {
        this.form = new FormGroup({});
        this.fields = this.getFields();
        this.model = {
            numberOfSlaves: this.ibn.numberOfSlaves,
        };
    }

    public getFields(): FormlyFieldConfig[] {

        const fields: FormlyFieldConfig[] = [];

        fields.push({
            key: "numberOfSlaves",
            type: "input",
            templateOptions: {
                type: "number",
                label: this.translate.instant("INSTALLATION.PROTOCOL_COMMERCIAL_CLUSTER.SLAVE_FILED_LABEL"),
                min: 1,
                max: 5,
                required: true,
            },
        });

        return fields;
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {

        if (this.form.invalid) {
            return;
        }

        this.ibn.numberOfSlaves = this.model.numberOfSlaves;
        this.nextViewEvent.emit(this.ibn);
    }

}
