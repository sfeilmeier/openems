import { SlicePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, Injector, OnDestroy, signal, Signal, } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { addIcons } from "ionicons";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { UserService } from "src/app/shared/service/user.service";
import { Edge, Service } from "src/app/shared/shared";
import { Language } from "src/app/shared/type/language";
import { StringUtils } from "src/app/shared/utils/string/string.utils";
import { SharedAutarchy } from "../common/autarchy/shared/shared";
import { SharedGrid } from "../common/grid/shared/shared";
import { SharedSelfConsumption } from "../common/selfconsumption/shared/shared";
import { SharedGridOptimizedCharge } from "../Controller/Ess/GridOptimizedCharge/shared/shared";
import { SharedControllerEssTimeOfUseTariff } from "../Controller/Ess/TimeOfUseTariff/shared/shared";
import { SharedControllerPeakShaving } from "../Controller/peak-shaving/shared/shared";
import { LiveDataService } from "../livedataservice";
import { Fena } from "./fena.type";
import cz from "./i18n/cz.json";
import de from "./i18n/de.json";
import en from "./i18n/en.json";
import es from "./i18n/es.json";
import fr from "./i18n/fr.json";
import ja from "./i18n/ja.json";
import nl from "./i18n/nl.json";

@Component({
    selector: "oe-fena",
    standalone: true,
    templateUrl: "./fena.component.html",
    imports: [IonicModule, TranslateModule, FormlyModule, SlicePipe],
    styleUrl: "./fena.component.scss",
    changeDetection: ChangeDetectionStrategy.Eager,
    providers: [{ provide: DataService, useClass: LiveDataService }],
})
export class FenaComponent implements OnDestroy {
    protected readonly maxCountOfMessages: number = 3;
    protected readonly messages: Signal<{ text: string; actions: ReturnType<Fena.Message["getActions"]> }[]> = computed(
        () => {
            return this.plainMessages().flatMap((message) => {
                const messageData = message.getData(this.injector);
                if (messageData == null || !message.show(messageData)) {
                    return [];
                }

                return [
                    {
                        text: message.getMessage(messageData),
                        actions: message.getActions(),
                    },
                ];
            });
        },
    );

    private readonly plainMessages = computed<Fena.Message[]>(() => {
        const areTranslationsLoaded = this.areTranslationsLoaded();
        if (!areTranslationsLoaded) {
            return [];
        }

        const edge = this.service.currentEdge();
        const user = this.userService.currentUser();

        if (edge == null || user == null) {
            return [];
        }

        return FenaComponent.createFenaMessages(edge, this.injector);
    });
    private readonly areTranslationsLoaded = signal<boolean>(false);

    private readonly userService = inject(UserService);
    private readonly service = inject(Service);
    private readonly translate = inject(TranslateService);
    private readonly injector = inject(Injector);

    constructor() {
        Language.normalizeAdditionalTranslationFiles({ cz: cz, de: de, en: en, es: es, fr: fr, ja: ja, nl: nl }).then(
            (translations) => {
                for (const { lang, translation, shouldMerge } of translations) {
                    this.translate.setTranslation(lang, translation, shouldMerge);
                }
                this.areTranslationsLoaded.set(true);
            },
        );

        let hasBeenSet = false;

        effect(async () => {
            const plainMessages = this.plainMessages();
            if (plainMessages.length === 0 || hasBeenSet) {
                return;
            }
            hasBeenSet = true;
            await Promise.all([
                Fena.LiveMessage.fetch(this.injector, plainMessages),
                Fena.HistoricEnergyMessage.fetch(this.injector, plainMessages),
            ]);
        });

        addIcons({
            "oe-fena": "icons/common/fena.svg",
        });
    }

    public static createFenaMessages(edge: Edge, injector: Injector): Fena.Message[] {
        const translate = injector.get(TranslateService);
        const config = edge.getConfigSignal()();
        const widgetNames: string[] = [
            ...(config?.widgets?.classes ?? []),
            ...(config?.widgets?.list ?? []).map((widget) => widget.name),
        ];

        if (
            StringUtils.isNotInArr(edge.id, [
                "fems4",
                "fems666",
                "fems888",
                "fems3800",
                "fems10004",
                "fems10303",
                "fems58732",
                "fems59509",
                "fems72127",
                "fems72317",
                "fems72800",
                "fems73475",
                "fems74326",
                "fems82085",
                "fems83584",
                "fems86450",
                "fems86876",
                "fems90206",
                "fems86287",
            ])
        ) {
            return [];
        }

        return (
            widgetNames
                .flatMap((widgetName): Fena.Message[] => {
                    switch (widgetName) {
                        case "Common_Autarchy":
                            return SharedAutarchy.getFenaMessages(translate, config, injector);
                        case "Common_Selfconsumption":
                            return SharedSelfConsumption.getFenaMessages(translate, config, injector);
                        case "Grid":
                            return SharedGrid.getFenaMessages(translate);
                        case "Controller.Asymmetric.PeakShaving":
                        case "Controller.Symmetric.PeakShaving":
                        case "Controller.TimeslotPeakshaving":
                            return SharedControllerPeakShaving.getFenaMessages(widgetName, config, translate);
                        case "Controller.Ess.GridOptimizedCharge":
                            return SharedGridOptimizedCharge.getFenaMessages(config, translate, injector);
                        case "Controller.Ess.Time-Of-Use-Tariff":
                            return SharedControllerEssTimeOfUseTariff.getFenaMessages(config, translate, injector);
                        default:
                            return [];
                    }
                })

                /** Sort the Fena messages by individual priority and then for same priorities by category priorities. */
                .sort((first, second) => {
                    const priority = first.getPriority() - second.getPriority();
                    if (priority !== 0) {
                        return priority;
                    }

                    return (
                        Fena.CATEGORIES.find((category) => category.name === first.getCategory())!.priority -
                        Fena.CATEGORIES.find((category) => category.name === second.getCategory())!.priority
                    );
                })
        );
    }

    ngOnDestroy() {
        Fena.LiveMessage.unsubscribe(this.injector, this.plainMessages());
    }
}
