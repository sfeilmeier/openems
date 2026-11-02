import { TranslateService } from "@ngx-translate/core";
import { TestingUtils } from "src/app/shared/components/shared/testing/utils.spec";
import { View } from "../shared/enums";
import { System } from "../shared/system";

describe("#getLineSideMeterFuseFields", () => {
    const EXPECTED_FIXED_VALUES = [
        25, 32, 35, 40, 50, 63, 80, 100, 120, 125, 160, 200, 250, 315, 355, 400, 500, 630, -1,
    ];
    let translate: TranslateService;

    beforeEach(async () => {
        const testContext = await TestingUtils.sharedSetup();
        translate = testContext.translate;
    });

    [...System.HOME_SYSTEMS, ...System.COMMERCIAL_SYSTEMS].forEach((systemId) => {
        it(`should offer the same fixed fuse values and "other" input for '${systemId}'`, () => {
            const ibn = System.getSystemObjectFromSystemId(systemId, translate);
            if (!ibn.views.includes(View.ConfigurationLineSideMeterFuse)) {
                return;
            }

            const fields = ibn.getLineSideMeterFuseFields();
            const fixedValue = fields.find((field) => field.key === "fixedValue");
            const otherValue = fields.find((field) => field.key === "otherValue");

            expect(fixedValue?.type).toEqual("select");
            expect((fixedValue?.templateOptions?.options as { value: number }[]).map((o) => o.value)).toEqual(
                EXPECTED_FIXED_VALUES,
            );
            expect(otherValue?.hideExpression).toBeDefined();
        });
    });
});
