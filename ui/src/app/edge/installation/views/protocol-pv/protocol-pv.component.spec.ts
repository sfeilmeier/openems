import { CUSTOM_ELEMENTS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule } from "@angular/forms";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { Home10Gen2FeneconIbn } from "../../installation-systems/home/home-10-gen2";
import { Home20FeneconIbn } from "../../installation-systems/home/home-20";
import { ProtocolPvComponent } from "./protocol-pv.component";

describe("ProtocolPvComponent", () => {
    let component: ProtocolPvComponent;
    let fixture: ComponentFixture<ProtocolPvComponent>;
    let translate: TranslateService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ProtocolPvComponent],
            imports: [ReactiveFormsModule, FormlyModule.forRoot(), TranslateModule.forRoot()],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
        }).compileComponents();

        translate = TestBed.inject(TranslateService);
        fixture = TestBed.createComponent(ProtocolPvComponent);
        component = fixture.componentInstance;
    });

    describe("#ngOnInit", () => {
        it("should set isSelected to true for enabled MPPTs in Gen2 systems (maxNumberOfMppt === 0)", () => {
            const ibn = new Home10Gen2FeneconIbn(translate);
            ibn.mppt = {
                mppt1: true,
                mppt2: false,
                mppt3: true,
            };

            component.ibn = ibn;
            component.ngOnInit();

            expect(component["forms"].length).toBe(3);
            expect(component["forms"][0].model.isSelected).toBeTrue();
            expect(component["forms"][0].fields.length).toBeGreaterThan(0);

            expect(component["forms"][1].model.isSelected).toBeFalse();
            expect(component["forms"][1].fields.length).toBe(0);

            expect(component["forms"][2].model.isSelected).toBeTrue();
            expect(component["forms"][2].fields.length).toBeGreaterThan(0);
        });

        it("should set isSelected to true for enabled MPPTs in Gen1 systems (maxNumberOfMppt > 0)", () => {
            const ibn = new Home20FeneconIbn(translate);
            ibn.mppt = {
                connectionCheck: true,
                mppt1: true,
                mppt2: false,
            };

            component.ibn = ibn;
            component.ngOnInit();

            expect(component["forms"].length).toBe(2);
            expect(component["forms"][0].model.isSelected).toBeTrue();
            expect(component["forms"][0].fields.length).toBeGreaterThan(0);

            expect(component["forms"][1].model.isSelected).toBeFalse();
            expect(component["forms"][1].fields.length).toBe(0);
        });

        it("should preserve existing DC model values if already present in ibn.pv.dc", () => {
            const ibn = new Home10Gen2FeneconIbn(translate);
            ibn.mppt = {
                mppt1: true,
                mppt2: false,
                mppt3: false,
            };
            ibn.pv = {
                dc: [
                    { isSelected: true, alias: "Rooftop East", value: 4500 } as any,
                ],
            };

            component.ibn = ibn;
            component.ngOnInit();

            expect(component["forms"][0].model.isSelected).toBeTrue();
            expect((component["forms"][0].model as any).alias).toBe("Rooftop East");
            expect((component["forms"][0].model as any).value).toBe(4500);
        });
    });

    describe("#onNextClicked", () => {
        it("should rebuild ibn.pv.dc array and emit nextViewEvent when forms are valid", () => {
            const ibn = new Home10Gen2FeneconIbn(translate);
            ibn.mppt = {
                mppt1: true,
                mppt2: false,
                mppt3: false,
            };

            component.ibn = ibn;
            component.ngOnInit();

            // Set required form fields to make form valid
            component["forms"][0].model.alias = "PV East";
            component["forms"][0].model.value = 3000;

            spyOn(component.nextViewEvent, "emit");
            component.onNextClicked();

            expect(component.nextViewEvent.emit).toHaveBeenCalledWith(ibn);
            expect(ibn.pv?.dc?.[0].isSelected).toBeTrue();
            expect(ibn.pv?.dc?.[1].isSelected).toBeFalse();
            expect(ibn.pv?.dc?.[2].isSelected).toBeFalse();
        });
    });

    describe("#onPreviousClicked", () => {
        it("should emit previousViewEvent", () => {
            spyOn(component.previousViewEvent, "emit");
            component.onPreviousClicked();
            expect(component.previousViewEvent.emit).toHaveBeenCalled();
        });
    });
});
