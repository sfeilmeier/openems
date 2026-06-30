import { CommonModule } from "@angular/common";
import { Component, computed, inject, Signal } from "@angular/core";
import { toObservable, toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { FormlyModule } from "@ngx-formly/core";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { formatRelative } from "date-fns";
import { catchError, from, of, switchMap } from "rxjs";
import { EnergySchedulerV2 } from "src/app/shared/components/edge/config-components/energy/energy";
import { GetSchedule } from "src/app/shared/components/edge/config-components/energy/getSchedule";
import { Converter } from "src/app/shared/components/shared/converter";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { UserService } from "src/app/shared/service/user.service";
import { Currency, Edge, EdgeConfig, Service } from "src/app/shared/shared";
import { Language } from "src/app/shared/type/language";
import { LiveDataService } from "../livedataservice";
import de from "./i18n/de.json";
import en from "./i18n/en.json";

interface FenaMessage {
    text: string;
    actions?: { title: string; callback: () => void }[];
}

@Component({
    selector: "oe-fena",
    standalone: true,
    templateUrl: "./fena.component.html",
    imports: [CommonModule, IonicModule, TranslateModule, FormlyModule],
    styleUrl: "./fena.component.scss",
    providers: [{ provide: DataService, useClass: LiveDataService }],
})
export class FenaComponent {
    /** Tracks both the selected edge and its config. */
    protected readonly userEdgeAndConfig = computed(() => {
        const user = this.userService.currentUser();
        const edge = this.service.currentEdge();

        return {
            user,
            edge,
            config: edge?.getConfigSignal()() ?? null,
        };
    });

    protected readonly messages: Signal<FenaMessage[]> = toSignal(
        toObservable(this.userEdgeAndConfig).pipe(
            switchMap(({ user, edge, config }) => {
                if (edge == null || config == null) {
                    return of<FenaMessage[]>([]);
                }

                // TODO INTERSOLAR
                if (user?.id === "intersolar@fenecon.de") {
                    switch (edge.id) {
                        case "fems31372":
                            return of<FenaMessage[]>([
                                {
                                    text: "Auch wenn deine <strong>Einspeisung aktuell auf 30 % begrenzt</strong> ist, geht kein Solarstrom für deinen Haushalt verloren. FEMS sorgt dafür, dass deine PV-Energie optimal genutzt wird und dein Verbrauch vollständig aus der eigenen Erzeugung gedeckt werden kann.",
                                },
                                {
                                    text: "Ein sonniger Tag für deine PV-Anlage: Voraussichtlich erzeugst du heute <strong>1.200 kWh</strong> Strom. Rund <strong>40 %</strong> davon decken direkt deinen eigenen Energiebedarf, während der restliche Solarstrom gewinnbringend ins Netz eingespeist wird.",
                                },
                            ]);
                        case "fems888":
                            return of<FenaMessage[]>([
                                {
                                    text: "Dein E-Auto wird jetzt so günstig wie möglich beladen, damit Du morgen <strong>um 7 Uhr losfahren</strong> kannst.",
                                    actions: [
                                        {
                                            title: "Smart Event anpassen",
                                            callback: () =>
                                                this.router.navigate(
                                                    ["evse", "ctrlEvseSingle0"],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                        {
                                            title: "Heute nicht laden",
                                            callback: () =>
                                                this.router.navigate(
                                                    [
                                                        "evse",
                                                        "ctrlEvseSingle0",
                                                        "charge-mode",
                                                    ],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                    ],
                                },
                                {
                                    text: "Dein Strompreis-Update: Dein dynamischer Strompreis schwankt zwischen <strong>minus 20 Cent und plus 19 Cent/kWh</cent>",
                                },
                            ]);
                        case "fems4":
                            return of<FenaMessage[]>([
                                {
                                    text: "Dein Speicher wird heute vorraussichtlich <strong>um 15:30 Uhr voll geladen</strong> sein.",
                                },
                                {
                                    text: 'Dein Speicher wird heute morgen durch "Entladung in den Verbrauch" genug freie Kapazität schaffen, damit du trotz Leistungsbegrenzung des Netzanschlusses keine Energie verschenkst.',
                                },
                            ]);
                        case "fems82085":
                            return of<FenaMessage[]>([
                                {
                                    text: 'Ab <strong>11 Uhr gibt es negative Börsenpreise</strong>. Dein Speicher versucht durch "Entladung in den Verbrauch" genug freie Kapazität im Speicher zu schaffen, damit Du in dieser Zeit nicht einspeisen wirst.',
                                },
                                {
                                    text: "Wenn du dein E-Auto ansteckst kann ich es heute mit kostenlosem PV Strom beladen.",
                                },
                            ]);
                        case "fems666":
                            return of<FenaMessage[]>([
                                {
                                    text: "Dein E-Auto wird jetzt so günstig wie möglich beladen, damit Du <strong>morgen um 7 Uhr</strong> losfahren kannst.",
                                    actions: [
                                        {
                                            title: "Smart Event anpassen",
                                            callback: () =>
                                                this.router.navigate(
                                                    ["evse", "ctrlEvseSingle0"],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                        {
                                            title: "Heute nicht laden",
                                            callback: () =>
                                                this.router.navigate(
                                                    [
                                                        "evse",
                                                        "ctrlEvseSingle0",
                                                        "charge-mode",
                                                    ],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                    ],
                                },
                                {
                                    text: "<strong>Heute bist du autark</strong> - nur mit Sonne und Stromspeicher!",
                                },
                            ]);
                        case "fems10303":
                            return of<FenaMessage[]>([
                                {
                                    text: "Dein E-Auto wird jetzt so günstig wie möglich beladen, damit Du <strong>morgen um 9 Uhr</strong losfahren kannst.",
                                    actions: [
                                        {
                                            title: "Smart Event anpassen",
                                            callback: () =>
                                                this.router.navigate(
                                                    ["evse", "ctrlEvseSingle0"],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                        {
                                            title: "Heute nicht laden",
                                            callback: () =>
                                                this.router.navigate(
                                                    [
                                                        "evse",
                                                        "ctrlEvseSingle0",
                                                        "charge-mode",
                                                    ],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                    ],
                                },
                                {
                                    text: "Dein Pufferspeicher hat aktuell eine <strong>Temperatur von 55 °C</strong> erreicht. Dein Heizstab läuft heute dank PV-Überschuss und negativen Börsenstrompreisen kostenlos.",
                                },
                            ]);
                        case "fems72127":
                            return of<FenaMessage[]>([
                                {
                                    text: "<strong>Heute bist du autark</strong> - nur mit Sonne und Stromspeicher!",
                                },
                                {
                                    text: "Dank der intelligenten Speichersteuerung von FEMS wirkt sich die 60 %-Einspeisebegrenzung nicht negativ auf deinen PV-Ertrag aus. So erzielst du trotz Limitierung mehr Einspeisevergütung, speist überschüssige Energie gewinnbringend ein und deckst deinen eigenen Strombedarf optimal.",
                                },
                            ]);
                        case "fems17289":
                            return of<FenaMessage[]>([
                                {
                                    text: "To reduce peak loads, your battery is discharging. This reduces the amount of power drawn from the grid.",
                                },
                                {
                                    text: "Your system will produce about 30 kWh today.",
                                },
                            ]);
                        case "fems65456":
                            return of<FenaMessage[]>([
                                {
                                    text: "Dein Speicher belädt sich heute während des Tages voll und entlädt sich am Abend - wenn der Strompreis am höchsten ist - ins Netz. Dabei werden planmäßig 25 kWh zu 18 Cent eingespeist.",
                                },
                                {
                                    text: "Du wirst heute durch die Direktvermarktung deiner Anlage 10,80 € verdienen",
                                },
                            ]);
                        case "fems33006":
                            return of<FenaMessage[]>([
                                {
                                    text: "Durch die Vorgaben der FEMS App Schreibzugriff hat dein System heute bereits 1.825 kWh entladen und 300 kWh beladen. Das entspricht 0,5 Vollzyklen.",
                                },
                                {
                                    text: "Dein Vermarkter gibt gerade Leistungsvorgaben ans System.",
                                },
                            ]);
                        case "fems31113":
                            return of<FenaMessage[]>([
                                {
                                    text: "Das Speichersystem wird durch deine PV Anlage vollgeladen, bereit für deine E-LKW Ladung heute Abend.",
                                },
                                {
                                    text: "Unsere Prognose erwartet heute einen sonnigen Tag mit viel PV-Energie.",
                                },
                            ]);
                        case "fems30776":
                            return of<FenaMessage[]>([
                                {
                                    text: "Heute Mittag wird sich das System kostenoptimiert aus deiner PV Anlage und günstigem Netzstrom beladen.",
                                },
                                {
                                    text: "Unsere Prognose erwartet heute einen sonnigen Tag mit viel PV-Energie.",
                                },
                            ]);
                        case "fems3625":
                            return of<FenaMessage[]>([
                                {
                                    text: "Bis Freitagabend läuft dein Multi-Use Speichersystem im Modus Lastspitzenkappung. Anschließend wird der Modus auf Eigenverbrauchsoptimierung wechseln",
                                    actions: [
                                        {
                                            title: "Einstellungen ändern",
                                            callback: () =>
                                                this.router.navigate(
                                                    ["common", "storage"],
                                                    {
                                                        relativeTo: this.route,
                                                    },
                                                ),
                                        },
                                    ],
                                },
                                {
                                    text: "Unsere Prognose erwartet heute einen sonnigen Tag mit viel PV-Energie.",
                                },
                            ]);
                    }
                }

                if (edge.id === "fems888") {
                    return from(this.fetchSchedulerMessages(edge, config)).pipe(
                        catchError((error) => {
                            console.warn(
                                "Error fetching scheduler messages:",
                                error,
                            );
                            return of<FenaMessage[]>([]);
                        }),
                    );
                }

                return of<FenaMessage[]>([]);
            }),
        ),
        {
            initialValue: [],
        },
    );

    private readonly dataService = inject(DataService);
    private readonly userService = inject(UserService);
    private readonly service = inject(Service);
    private readonly translate = inject(TranslateService);
    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);

    constructor() {
        Language.normalizeAdditionalTranslationFiles({ de: de, en: en }).then(
            (translations) => {
                for (const { lang, translation, shouldMerge } of translations) {
                    this.translate.setTranslation(
                        lang,
                        translation,
                        shouldMerge,
                    );
                }
            },
        );
    }

    private async fetchSchedulerMessages(
        edge: Edge,
        config: EdgeConfig,
    ): Promise<FenaMessage[]> {
        const messages: (FenaMessage | null)[] = [];

        const energyScheduler = new EnergySchedulerV2(config);
        await energyScheduler.updateSchedule(edge, this.service.websocket);

        const data = energyScheduler?.schedule?.result?.data ?? [];
        const predictionData = data.filter((e) => e.type === "PREDICTION");

        if (predictionData.length !== 0) {
            messages.push(
                this.getEvseSmartEventMessage(),
                this.getMinMaxGridPriceMessage(edge, config, predictionData),
            );
        }

        return messages.filter((e) => e !== null);
    }

    private getEvseSmartEventMessage(): FenaMessage | null {
        const locale = Language.getCurrentLanguage().dateFnsLocale;
        const baseDate = new Date();
        const date = new Date();
        date.setHours(7, 0, 0, 0);
        if (date <= baseDate) {
            date.setDate(date.getDate() + 1);
        }
        const formattedTime = formatRelative(date, baseDate, { locale });

        return {
            text:
                "Dein E-Auto wird jetzt so günstig wie möglich beladen, damit Du " +
                formattedTime +
                " Uhr losfahren kannst",
            actions: [
                {
                    title: "Smart Event anpassen",
                    callback: () =>
                        this.router.navigate(["evse", "ctrlEvseSingle0"], {
                            relativeTo: this.route,
                        }),
                },
                {
                    title: "Heute nicht laden",
                    callback: () =>
                        this.router.navigate(["evse", "ctrlEvseSingle0"], {
                            relativeTo: this.route,
                        }),
                },
            ],
        };
    }

    private getMinMaxGridPriceMessage(
        edge: Edge,
        config: EdgeConfig,
        predictionData: GetSchedule.Response["result"]["data"],
    ): FenaMessage | null {
        let min: { timestamp: string; value: number } | null = null;
        let max: { timestamp: string; value: number } | null = null;
        for (const d of predictionData) {
            const price = d._sum?.GridBuyPrice;
            if (price !== null && price !== undefined) {
                if (min == null || price < min.value) {
                    min = { timestamp: d.timestamp, value: price };
                }
                if (max == null || price > max.value) {
                    max = { timestamp: d.timestamp, value: price };
                }
            }
        }

        if (min == null || max == null) {
            return null;
        }

        const locale = Language.getCurrentLanguage().dateFnsLocale;
        const meta = config.getComponentSafely("_meta");
        const currency = config.getPropertyFromComponent<string>(
            meta,
            "currency",
        );
        const currencyLabel: Currency.Label =
            Currency.getCurrencyLabelByCurrency(currency);
        const converter = Converter.CURRENCY_PER_MWH_TO_KWH(currencyLabel);

        const baseDate = new Date();
        const formattedMaxTime = formatRelative(max.timestamp, baseDate, {
            locale,
        });
        const formattedMinTime = formatRelative(min.timestamp, baseDate, {
            locale,
        });
        const messageText =
            this.translate.instant("FENA.ELECTRICITY_PRICES_SUMMARY", {
                maxPrice: converter(max.value),
                maxTime: formattedMaxTime,
                minPrice: converter(min.value),
                minTime: formattedMinTime,
            }) ??
            `Deine Strompreise:<br/>Der höchste ist <strong>${converter(max.value)}</strong> ${formattedMaxTime} Uhr.<br/>Der niedrigste ist <strong>${converter(min.value)}</strong> ${formattedMinTime} Uhr.`;

        return {
            text: messageText,
            actions: [
                {
                    title: this.translate.instant("GENERAL.DETAILS"),
                    callback: () =>
                        this.router.navigate(["common", "grid"], {
                            relativeTo: this.route,
                        }),
                },
            ],
        };
    }
}
