import { SlicePipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, computed, effect, inject, Injector, OnDestroy, signal, Signal, } from "@angular/core";
import { IonicModule } from "@ionic/angular";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { addIcons } from "ionicons";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { UserService } from "src/app/shared/service/user.service";
import { Service } from "src/app/shared/shared";
import { Language } from "src/app/shared/type/language";
import { LiveDataService } from "../livedataservice";
import { Fena } from "./fena.type";
import de from "./i18n/de.json";
import en from "./i18n/en.json";

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

    private readonly areTranslationsLoaded = signal<boolean>(false);

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

        return edge.createFenaMessages(this.injector);
    });

    private readonly userService = inject(UserService);
    private readonly service = inject(Service);
    private readonly translate = inject(TranslateService);
    private readonly injector = inject(Injector);

    constructor() {
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then((translations) => {
            for (const { lang, translation, shouldMerge } of translations) {
                this.translate.setTranslation(lang, translation, shouldMerge);
            }
            this.areTranslationsLoaded.set(true);
        });

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

    ngOnDestroy() {
        Fena.LiveMessage.unsubscribe(this.injector, this.plainMessages());
    }
}
