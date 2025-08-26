// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { FormlyFieldConfig } from "@ngx-formly/core";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { FeedInType } from "../../shared/enums";
import { System } from "../../shared/system";

@Component({
  selector: ProtocolFeedInLimitationComponent.SELECTOR,
  templateUrl: "./protocol-feed-in-limitation.component.html",
  standalone: false,
})
export class ProtocolFeedInLimitationComponent implements OnInit {

  private static readonly SELECTOR = "protocol-feed-in-limitation";

  @Input() public ibn: AbstractIbn;
  @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
  @Output() public nextViewEvent = new EventEmitter<AbstractIbn>();

  public form: FormGroup;
  public fields: FormlyFieldConfig[];
  public model;
  public showRundSteuerManual: boolean;
  public readonly FeedInType = FeedInType;
  private totalPvPower: number = 0;

  public get isDynamicLimitation(): boolean {
    return this.form.get("feedInType")?.value === FeedInType.DYNAMIC_LIMITATION;
  }

  public get isExternalLimitation(): boolean {
    return this.form.get("feedInType")?.value === FeedInType.EXTERNAL_LIMITATION;
  }

  public ngOnInit() {
    this.showRundSteuerManual = this.ibn.showRundSteuerManual;
    this.form = new FormGroup({});
    this.fields = this.ibn.getFeedInLimitFields();
    this.model = this.ibn.feedInLimitation ?? {};
    this.totalPvPower = this.model.maximumFeedInPower;
  }

  public onPreviousClicked() {
    this.previousViewEvent.emit();
  }

  public onNextClicked() {
    if (this.form.invalid || this.form.controls["isManualProperlyFollowedAndRead"]?.value == false) {
      return;
    }

    // fields are different for different system. So we do it in individual system level.
    this.ibn.setFeedInLimitFields(this.model);

    this.ibn.feedInLimitation.maximumFeedInPower = this.form.controls["maximumFeedInPower"]?.dirty ? this.form.controls["maximumFeedInPower"].value : this.totalPvPower;
    this.nextViewEvent.emit(this.ibn);
  }

  protected openManual() {
    window.open(System.getRundsteuerManual(this.ibn.systemId));
  }
}
