// @ts-strict-ignore
import { HttpClient } from "@angular/common/http";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Meta, Title } from "@angular/platform-browser";
import { NavigationEnd, Router } from "@angular/router";
import { SplashScreen } from "@capacitor/splash-screen";
import { MenuController, ModalController, NavController, Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Subject, Subscription, timer } from "rxjs";
import { filter, retry, switchMap, takeUntil } from "rxjs/operators";
import { environment } from "../environments";
import { PlatFormService } from "./platform.service";
import { NavigationService } from "./shared/components/navigation/service/navigation.service";
import { AppStateTracker } from "./shared/ngrx-store/states";
import { GlobalRouteChangeHandler } from "./shared/service/globalRouteChangeHandler";
import { RouteService } from "./shared/service/route.service";
import { UserService } from "./shared/service/user.service";
import { Service, UserPermission, Websocket } from "./shared/shared";
import { Language } from "./shared/type/language";

export interface CachetComponentStatus {
    data: {
        status: 1 /* Operational */ | 2 /* Performance Issues */ | 3 /* Partial Outage */ | 4 /* Major Outage */
    }
}

@Component({
    selector: "app-root",
    templateUrl: "app.component.html",
    standalone: false,
})
export class AppComponent implements OnInit, OnDestroy {

    public environment = environment;
    public backUrl: string | boolean = "/";
    public enableSideMenu: boolean;
    public isSystemLogEnabled: boolean = false;

    protected isSystemOutage = false;
    protected isUserAllowedToSeeOverview: boolean = false;
    protected isUserAllowedToSeeFooter: boolean = false;
    protected isHistoryDetailView: boolean = false;
    protected latestIncident: { message: string | null, id: string } | null = null;

    private ngUnsubscribe: Subject<void> = new Subject<void>();
    private subscription: Subscription = new Subscription();

    constructor(
        private platform: Platform,
        private http: HttpClient,
        public menu: MenuController,
        public modalCtrl: ModalController,
        public router: Router,
        public service: Service,
        private userService: UserService,
        public toastController: ToastController,
        public websocket: Websocket,
        private globalRouteChangeHandler: GlobalRouteChangeHandler,
        private meta: Meta,
        private appService: PlatFormService,
        private title: Title,
        private stateService: AppStateTracker,
        protected navigationService: NavigationService,
        protected navCtrl: NavController,
        private translate: TranslateService,
        private routeService: RouteService,
    ) {
        service.setLang(Language.getByKey(localStorage.LANGUAGE) ?? Language.getByBrowserLang(navigator.language));

        this.subscription.add(
            this.service.metadata.pipe(filter(metadata => !!metadata)).subscribe(metadata => {
                this.isUserAllowedToSeeOverview = UserPermission.isUserAllowedToSeeOverview(metadata.user);
                this.isUserAllowedToSeeFooter = UserPermission.isUserAllowedToSeeFooter(metadata.user);
            }));

        this.subscription.add(
            this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe((e: NavigationEnd) => {
                // Hide footer for history detail views
                const segments = e.url.split("/");
                this.isHistoryDetailView = segments.slice(0, -1).includes("history");
            }));

        this.appService.listen();
        SplashScreen.hide();
    }

    public navigateToUser() {
        const prev = this.routeService.getCurrentUrl();
        const base = prev.replace(/^\//, "");
        const userUrl = base + "/user";

        this.navCtrl.navigateRoot(userUrl);
        this.menu.close();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
        this.subscription.unsubscribe();
    }

    ngOnInit() {
        this.pollSystemStatus();

        // Checks if sessionStorage is not null, undefined or empty string
        if (localStorage.getItem("DEBUGMODE")) {
            this.environment.debugMode = JSON.parse(localStorage.getItem("DEBUGMODE"));
        }

        this.service.notificationEvent.pipe(takeUntil(this.ngUnsubscribe)).subscribe(async notification => {
            const toast = await this.toastController.create({
                message: notification.message,
                position: "top",
                duration: 2000,
                buttons: [
                    {
                        text: "Ok",
                        role: "cancel",
                    },
                ],
            });
            toast.present();
        });

        this.platform.ready().then(() => {
            // OEM colors exist only after ionic is initialized, so the notch color has to be set here
            const notchColor = getComputedStyle(document.documentElement).getPropertyValue("--ion-color-background");
            this.meta.updateTag(
                { name: "theme-color", content: notchColor },
            );
            this.service.deviceHeight = this.platform.height();
            this.service.deviceWidth = this.platform.width();
            this.checkSmartphoneResolution(true);
            this.platform.resize.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
                this.service.deviceHeight = this.platform.height();
                this.service.deviceWidth = this.platform.width();
                this.checkSmartphoneResolution(false);
            });
        });

        this.title.setTitle(environment.edgeShortName);
    }

    /**
     * Get system status from https://status.fenecon.de
     */
    private pollSystemStatus(): void {
        timer(1 /* immediately */, 5 * 60 * 1000 /* and then every 5 minutes */)
            .pipe(
                switchMap(() => this.http.get<CachetComponentStatus>("https://status.fenecon.de/api/v1/components/3")),
                retry(
                    { count: 5, delay: 5000 }
                ))
            .subscribe((data) => {
                switch (data.data.status) {
                    case 2:
                    case 3:
                    case 4:
                        this.isSystemOutage = true;
                        break;
                    case 1:
                        this.isSystemOutage = false;
                        break;
                }
            });
    }

    private checkSmartphoneResolution(init: boolean): void {
        if (init == true) {
            if (this.platform.width() <= 576) {
                this.service.isSmartphoneResolution = true;
                this.service.isSmartphoneResolutionSubject.next(true);
            } else if (this.platform.width() > 576) {
                this.service.isSmartphoneResolution = false;
                this.service.isSmartphoneResolutionSubject.next(false);
            }
        } else {
            if (this.platform.width() <= 576 && this.service.isSmartphoneResolution == false) {
                this.service.isSmartphoneResolution = true;
                this.service.isSmartphoneResolutionSubject.next(true);
            } else if (this.platform.width() > 576 && this.service.isSmartphoneResolution == true) {
                this.service.isSmartphoneResolution = false;
                this.service.isSmartphoneResolutionSubject.next(false);
            }
        }
    }
}
