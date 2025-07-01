// @ts-strict-ignore
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, ViewWillLeave } from "@ionic/angular";
import { filter, take } from "rxjs/operators";
import { SubscribeEdgesRequest } from "src/app/shared/jsonrpc/request/subscribeEdgesRequest";
import { ChannelAddress, Edge, Service, Websocket } from "src/app/shared/shared";
import { ProductType } from "../shared/type/widget";
import { DateUtils } from "../shared/utils/date/dateutils";

/*** This component is needed as a routing parent and acts as a transit station without being displayed.*/
@Component({
    selector: "edge",
    template: `
    <ion-content></ion-content>
         <ion-router-outlet id="content"></ion-router-outlet>
    `,
    standalone: false,
})
export class EdgeComponent implements OnInit, OnDestroy, ViewWillLeave {

    protected latestIncident: { message: string | null, id: string } | null = null;

    private edge: Edge | null = null;

    constructor(
        protected navCtrl: NavController,
        private activatedRoute: ActivatedRoute,
        private service: Service,
        private websocket: Websocket,
    ) { }

    public ngOnInit(): void {
        this.activatedRoute.params.subscribe((params) => {
            // Set CurrentEdge in Metadata
            const edgeId = params["edgeId"];
            this.service.updateCurrentEdge(edgeId).then((edge) => {
                this.edge = edge;

                this.checkMessages();
                this.service.websocket.sendRequest(new SubscribeEdgesRequest({ edges: [edgeId] }))
                    .then(() => {

                        // Subscribe on these channels for the state in HeaderComponent
                        edge.subscribeChannels(this.websocket, "", [
                            new ChannelAddress("_sum", "State"),
                        ]);
                    });
            }).catch(() => {
                this.navCtrl.navigateRoot("index");
            });
        });
    }

    public checkMessages(): void {
        this.edge.getConfig(this.websocket)
            .pipe(
                filter(metadata => !!metadata),
                take(1),
            )
            .subscribe((config) => {
                if (this.edge.producttype !== ProductType.HOME_20_30) {
                    return;
                }

                const hasGoodWeTwoStringMpptFactory = config.getComponentsByFactory("GoodWe.Charger.Mppt.Two-String").length > 0 && DateUtils.isDateBefore(this.edge.firstSetupProtocol, DateUtils.stringToDate("2024-04-18"));
                if (hasGoodWeTwoStringMpptFactory) {
                    this.latestIncident = {
                        message: `
                        Lieber Kunde,</br></br> 
                        trotz intensiven Bemühungen ist es aus technischen Gründen bei doppelt belegten Mpp-Trackern nicht möglich, die Aufteilung unter den PV-Strings korrekt im Monitoring abzubilden. 
                        Um die Leistung Ihrer Photovoltaik-Anlage an Ihrem FENECON Home korrekt wiederzugeben, wurde daher auf die Anzeige von MPP-Trackern als kleinste einzeln angezeigte 
                        Erzeugungseinheit umgestellt. 
                        Hier handelte es sich lediglich um ein Darstellungsproblem, das korrigiert wurde. Die Funktion der Anlage war und ist in keiner Weise dadurch eingeschränkt. 
                        Die Summe aller Erzeugungswerte sollte daher auch gleich sein, falls dies nicht der Fall ist, kontaktieren Sie uns gerne unter service@fenecon.de.</br></br>
                        Freundliche Grüße,</br>
                        Ihr FENECON-Team
                `, id: "mppt-change-over",
                    };
                }
            });
    }

    public ionViewWillLeave() {
        this.ngOnDestroy();
    }

    public ngOnDestroy(): void {
        this.service.currentEdge.set(null);
        if (!this.edge) {
            return;
        }
        this.edge.unsubscribeAllChannels(this.websocket);
    }
}
