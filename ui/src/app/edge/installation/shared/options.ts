import { TranslateService } from "@ngx-translate/core";
import { FeedInSetting } from "./enums";

export const DIRECTIONS_OPTIONS = (translate: TranslateService) => {
    const south = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.SOUTH");
    const southWest = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.SOUTH_WEST");
    const west = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.WEST");
    const southEast = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.SOUTH_EAST");
    const east = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.EAST");
    const northWest = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.NORTH_WEST");
    const northEast = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.NORTH_EAST");
    const north = translate.instant("INSTALLATION.PROTOCOL_PV.DIRECTIONS.NORTH");
    return [
        { label: south, value: south },
        { label: southWest, value: southWest },
        { label: west, value: west },
        { label: southEast, value: southEast },
        { label: east, value: east },
        { label: northWest, value: northWest },
        { label: northEast, value: northEast },
        { label: north, value: north },
    ];
};


export const FEED_IN_POWER_FACTOR_OPTIONS = (translate: TranslateService) => {
    const inductive = translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.INDUCTIVE");
    const capacitive = translate.instant("INSTALLATION.PROTOCOL_FEED_IN_MANAGEMENT.CAPACITIVE");
    return [
        // Leading
        { label: "1", value: FeedInSetting.Leading_1 },
        { label: "0.90 (" + inductive + ")", value: FeedInSetting.Leading_0_90 },
        { label: "0.91 (" + inductive + ")", value: FeedInSetting.Leading_0_91 },
        { label: "0.92 (" + inductive + ")", value: FeedInSetting.Leading_0_92 },
        { label: "0.93 (" + inductive + ")", value: FeedInSetting.Leading_0_93 },
        { label: "0.94 (" + inductive + ")", value: FeedInSetting.Leading_0_94 },
        { label: "0.95 (" + inductive + ")", value: FeedInSetting.Leading_0_95 },
        { label: "0.96 (" + inductive + ")", value: FeedInSetting.Leading_0_96 },
        { label: "0.97 (" + inductive + ")", value: FeedInSetting.Leading_0_97 },
        { label: "0.98 (" + inductive + ")", value: FeedInSetting.Leading_0_98 },
        { label: "0.99 (" + inductive + ")", value: FeedInSetting.Leading_0_99 },
        // Lagging
        { label: "-0.90 (" + capacitive + ")", value: FeedInSetting.Lagging_0_90 },
        { label: "-0.91 (" + capacitive + ")", value: FeedInSetting.Lagging_0_91 },
        { label: "-0.92 (" + capacitive + ")", value: FeedInSetting.Lagging_0_92 },
        { label: "-0.93 (" + capacitive + ")", value: FeedInSetting.Lagging_0_93 },
        { label: "-0.94 (" + capacitive + ")", value: FeedInSetting.Lagging_0_94 },
        { label: "-0.95 (" + capacitive + ")", value: FeedInSetting.Lagging_0_95 },
        { label: "-0.96 (" + capacitive + ")", value: FeedInSetting.Lagging_0_96 },
        { label: "-0.97 (" + capacitive + ")", value: FeedInSetting.Lagging_0_97 },
        { label: "-0.98 (" + capacitive + ")", value: FeedInSetting.Lagging_0_98 },
        { label: "-0.99 (" + capacitive + ")", value: FeedInSetting.Lagging_0_99 },
    ];
};

