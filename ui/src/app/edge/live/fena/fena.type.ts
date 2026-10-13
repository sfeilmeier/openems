import { Injector, signal, untracked } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { NavigationService } from "src/app/shared/components/navigation/service/navigation.service";
import { NavigationTree } from "src/app/shared/components/navigation/shared";
import { DataService } from "src/app/shared/components/shared/dataservice";
import { QueryHistoricTimeseriesEnergyRequest } from "src/app/shared/jsonrpc/request/queryHistoricTimeseriesEnergyRequest";
import { QueryHistoricTimeseriesEnergyResponse } from "src/app/shared/jsonrpc/response/queryHistoricTimeseriesEnergyResponse";
import { ChannelAddress, CurrentData, Service } from "src/app/shared/shared";
import { DefaultTypes } from "src/app/shared/type/defaulttypes";
import { ArrayUtils } from "src/app/shared/utils/array/array.utils";
import { DateUtils } from "src/app/shared/utils/date/dateutils";

export namespace Fena {
    type CategoryName = "GRID" | "STORAGE" | "KPI";

    type FenaMessageType<T> =
        | { text: string; textCallback?: never }
        | {
              text?: never;
              textCallback: (currentData: T) => string;
          };

    type FenaCategory = {
        name: CategoryName;
        priority: number;
    };

    const CATEGORY_NAMES_BY_PRIORITY = {
        0: "GRID",
        1: "STORAGE",
        2: "KPI",
    } as const satisfies Record<number, string>;

    export const CATEGORIES: FenaCategory[] = Object.entries(CATEGORY_NAMES_BY_PRIORITY).map(([priority, name]) => ({
        name,
        priority: Number(priority),
    }));

    export namespace MessageUtils {
        /**
         * The detail action builder for Fena messages.
         *
         * @param nodeId The ID of the navigation node.
         * @param injector The global injector.
         * @returns An object containing the title and callback for the detail action.
         */
        export function buildDetailAction(
            nodeId: NavigationTree["id"],
            injector: Injector,
        ): { title: string; callback: () => void } {
            const translate = injector.get(TranslateService);
            const navigationService = injector.get(NavigationService);
            return {
                callback: () => {
                    const navigations = navigationService.navigationTree()?.getAbsoluteNavigations() ?? [];
                    const node = navigations?.find((navigation) => navigation.id === nodeId) ?? null;

                    if (node == null) {
                        return;
                    }
                    navigationService.navigateAbsolute(node);
                },
                title: translate.instant("GENERAL.DETAILS"),
            };
        }
    }

    /**
     * Abstract base class for Fena messages.
     *
     * @template T The type of data the message operates on.
     */
    export abstract class Message<T = any> {
        constructor(
            protected readonly category: (typeof CATEGORIES)[number]["name"],
            protected readonly priority: number = 0,
            protected readonly channels: ChannelAddress[] = [],
            protected readonly showCallback: (data: T) => boolean = (currentData: T) => true,
            protected readonly actions: { title: string; callback: () => void }[] = [],
            protected readonly message: FenaMessageType<T>,
        ) {}

        public show(data: T): boolean {
            return this.showCallback(data);
        }

        public getMessage(currentData: T): string {
            if (this.message.textCallback != null) {
                return this.message.textCallback(currentData);
            }
            return this.message.text;
        }

        public getPriority(): number {
            return this.priority;
        }

        public getCategory(): (typeof CATEGORIES)[number]["name"] {
            return this.category;
        }

        public getActions(): { title: string; callback: () => void }[] {
            return this.actions;
        }

        public getChannels(): ChannelAddress[] {
            return this.channels;
        }

        /**
         * Gets the data for this message.
         *
         * @param injector The global injector
         */
        public abstract getData(injector: Injector): T | null;
    }

    /**
     * Represents a Fena message that deals with historic energy data.
     *
     * @extends Message<QueryHistoricTimeseriesEnergyResponse>
     */
    export class HistoricEnergyMessage extends Message<QueryHistoricTimeseriesEnergyResponse> {
        private readonly data = signal<QueryHistoricTimeseriesEnergyResponse | null>(null);

        constructor(
            protected override readonly category: (typeof CATEGORIES)[number]["name"],
            protected override readonly priority: number = 0,
            protected override readonly actions: { title: string; callback: () => void }[] = [],
            protected override readonly channels: ChannelAddress[] = [],
            protected override readonly showCallback: (data: QueryHistoricTimeseriesEnergyResponse) => boolean = (
                data: QueryHistoricTimeseriesEnergyResponse,
            ) => true,
            protected override readonly message: FenaMessageType<QueryHistoricTimeseriesEnergyResponse>,
            protected period: DefaultTypes.HistoryPeriod,
        ) {
            super(category, priority, channels, showCallback, actions, message);
        }

        /**
         * Fetches historic data for the given Fena messages. Grouping messages that share the same period into a single
         * combined JSON-RPC request and evaluating them.
         *
         * @param injector The global injector
         * @param messages The messages
         * @returns
         */
        public static async fetch(injector: Injector, messages: Message[]): Promise<void> {
            const historyMessages = messages.filter(
                (el): el is HistoricEnergyMessage => el instanceof HistoricEnergyMessage,
            );
            const service = injector.get(Service);
            const edge = untracked(() => service.currentEdge());
            if (historyMessages.length === 0 || edge == null) {
                return;
            }

            const requestGroups = new Map<string, HistoricEnergyMessage[]>();
            for (const msg of historyMessages) {
                if (untracked(() => msg.data() != null)) {
                    continue;
                }
                const key = `${msg.period.from.toISOString()}_${msg.period.to.toISOString()}`;
                const group = requestGroups.get(key) ?? [];
                group.push(msg);
                requestGroups.set(key, group);
            }

            const requests = Array.from(requestGroups.entries())
                .map(([key, group]) => {
                    const period = ArrayUtils.getFirstSafely(group)?.period ?? null;
                    if (period == null) {
                        return null;
                    }
                    const channels = group.flatMap((el) => el.channels);
                    const from = DateUtils.maxDate(period.from, edge.firstSetupProtocol);
                    if (from == null) {
                        return null;
                    }
                    return new QueryHistoricTimeseriesEnergyRequest(from, period.to, channels);
                })
                .filter((req): req is QueryHistoricTimeseriesEnergyRequest => req != null);

            const result = await Promise.all(
                requests.map((req) => edge.sendRequest<QueryHistoricTimeseriesEnergyResponse>(service.websocket, req)),
            );

            if (result.length !== historyMessages.length) {
                return;
            }

            for (let i = 0; i < historyMessages.length; i++) {
                historyMessages[i].data.set(result[i]);
            }
        }

        getData(): QueryHistoricTimeseriesEnergyResponse | null {
            return this.data();
        }
    }

    /**
     * Represents a Fena message that deals with live data.
     *
     * @extends Message<CurrentData>
     */
    export class LiveMessage extends Message<CurrentData> {
        constructor(
            protected readonly params: {
                readonly category: (typeof CATEGORIES)[number]["name"];
                readonly priority: number;
                readonly actions: { title: string; callback: () => void }[];
                readonly channels: ChannelAddress[];
                readonly showCallback: (data: CurrentData) => boolean;
                readonly message: FenaMessageType<CurrentData>;
            },
        ) {
            super(
                params.category,
                params.priority,
                params.channels,
                params.showCallback,
                params.actions,
                params.message,
            );
        }

        /**
         * Fetches the live data for the given messages.
         *
         * @param injector The global injector
         * @param messages The messages
         */
        static fetch(injector: Injector, messages: Message[]): void {
            const dataService = injector.get(DataService);
            const service = injector.get(Service);
            const edge = untracked(() => service.currentEdge());
            const liveMessages = messages.filter((el): el is LiveMessage => el instanceof LiveMessage);

            if (edge != null && liveMessages.length > 0) {
                dataService.subscribeChannels(
                    liveMessages.flatMap((el) => el.getChannels()),
                    edge,
                );
            }
        }

        /**
         * Unsubscribes the given live messages from their channels.
         *
         * @param injector The global injector
         * @param messages The messages
         */
        static unsubscribe(injector: Injector, messages: Message[]): void {
            const liveMessages = messages.filter((el): el is LiveMessage => el instanceof LiveMessage);
            const dataService = injector.get(DataService);
            const service = injector.get(Service);
            const edge = untracked(() => service.currentEdge());

            if (edge != null) {
                dataService.unsubscribeFromChannels(liveMessages.flatMap((el) => el.getChannels()));
            }
        }

        getData(injector: Injector): CurrentData {
            return injector.get(DataService).currentValue();
        }
    }
}
