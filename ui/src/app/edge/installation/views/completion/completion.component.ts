// @ts-strict-ignore
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { format } from "date-fns";
import { saveAs } from "file-saver-es";
import { GetSetupProtocolRequest } from "src/app/shared/jsonrpc/request/getSetupProtocolRequest";
import { Base64PayloadResponse } from "src/app/shared/jsonrpc/response/base64PayloadResponse";
import { Edge, Service, Websocket } from "src/app/shared/shared";
import { environment } from "src/environments";
import { AbstractIbn } from "../../installation-systems/abstract-ibn";
import { SystemId } from "../../shared/system";

@Component({
    selector: CompletionComponent.SELECTOR,
    templateUrl: "./completion.component.html",
    standalone: false,
})
export class CompletionComponent implements OnInit {

    private static readonly SELECTOR = "completion";

    @Input() public ibn: AbstractIbn;
    @Input() public edge: Edge;
    @Output() public previousViewEvent: EventEmitter<any> = new EventEmitter();
    @Output() public nextViewEvent: EventEmitter<any> = new EventEmitter();
    public system: SystemId | null = null;
    public isWaiting = false;
    protected readonly showHeckertNote: boolean = environment.theme === "Heckert";
    private readonly MAX_RETRIES = 3; // Number of retry attempts
    private readonly RETRY_DELAY = 3000; // Delay between retries (in milliseconds)

    constructor(
        private service: Service,
        private websocket: Websocket,
        private translate: TranslateService,
        private router: Router,
    ) { }

    public ngOnInit(): void {
        this.system = this.ibn.systemId;
        this.isWaiting = true;

        this.ibn.getProtocol(this.edge, this.websocket).then((protocolId) => {
            this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.SENT_SUCCESSFULLY"), "success");
            this.ibn.setupProtocolId = protocolId;
        }).catch((reason) => {
            this.service.toast(this.translate.instant("INSTALLATION.PROTOCOL_SERIAL_NUMBERS.ERROR_SENDING"), "danger");
            console.warn(reason);
        }).finally(() => {
            this.isWaiting = false;
        });
    }

    public onPreviousClicked() {
        this.previousViewEvent.emit();
    }

    public onNextClicked() {
        this.nextViewEvent.emit();
    }

    public async downloadProtocol(): Promise<void> {
        const request = new GetSetupProtocolRequest({ setupProtocolId: this.ibn.setupProtocolId });
        this.isWaiting = true;

        let attempt = 0;

        while (attempt < this.MAX_RETRIES) {
            try {
                const response: Base64PayloadResponse = await this.websocket.sendRequest(request) as Base64PayloadResponse;

                if (!response?.result?.payload) {
                    this.service.toast(this.translate.instant("INSTALLATION.COMPLETION.INVALID_PAYLOAD"), "danger", 3000);
                    return; // Exit on invalid payload
                }

                const binary = atob(response.result.payload.replace(/\s/g, ""));
                const length = binary.length;

                const buffer = new ArrayBuffer(length);
                const view = new Uint8Array(buffer);

                for (let i = 0; i < length; i++) {
                    view[i] = binary.charCodeAt(i);
                }

                const data: Blob = new Blob([view], {
                    type: "application/pdf",
                });

                const fileName = `IBN-${this.edge.id}-${format(new Date(), "dd.MM.yyyy")}.pdf`;

                saveAs(data, fileName);
                this.service.toast(this.translate.instant("INSTALLATION.COMPLETION.DOWNLOAD_SUCCESS"), "success");
                return; // Exit the loop on success
            } catch (error) {
                attempt++;

                if (attempt >= this.MAX_RETRIES) {
                    console.error("Download Protocol Error:", error);
                    this.service.toast(this.translate.instant("INSTALLATION.COMPLETION.DOWNLOAD_ERROR"), "danger");
                } else {
                    console.warn(`Retrying download protocol... (${attempt}/${this.MAX_RETRIES})`);
                    await this.delay(this.RETRY_DELAY);
                }
            } finally {
                this.isWaiting = false;
            }
        }
    }

    protected navigate() {
        this.router.navigate(["device/" + (this.edge.id) + "/settings/app"]);
    }

    /** Utility function to introduce delay */
    private delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
