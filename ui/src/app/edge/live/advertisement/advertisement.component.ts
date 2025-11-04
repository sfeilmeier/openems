// @ts-strict-ignore
import { AfterContentChecked, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ModalController } from "@ionic/angular";
import { Role } from "src/app/shared/type/role";
import { AdvertWidget } from "src/app/shared/type/widget";
import { environment } from "src/environments";
import { Service } from "../../../shared/shared";


@Component({
    selector: "advertisement",
    templateUrl: "./advertisement.component.html",
    standalone: false,
})

export class AdvertisementComponent implements OnInit, AfterContentChecked, OnDestroy {
    private static readonly MAX_SHOW_DATE = new Date(2025, 8, 24);

    @Input() public advertWidgets: AdvertWidget[] = [];

    @ViewChild("swiper") public swiperRef: ElementRef | undefined;

    public title: AdvertWidget["title"];

    // New properties to check which title to display
    public displayRawTitle: boolean = false;

    protected enableBtn: boolean = false;
    protected disablePrevBtn: boolean | null = null;
    protected disableNextBtn: boolean | null = null;
    protected isAtLeastInstaller: boolean = false;

    constructor(
        public modalCtrl: ModalController,
        public service: Service,
        private cdref: ChangeDetectorRef,
    ) {
        this.service.getCurrentEdge().then(edge => {
            this.isAtLeastInstaller = edge.roleIsAtLeast(Role.INSTALLER);
        });
    }

    ngAfterContentChecked() {
        this.cdref.detectChanges();
    }

    ngOnInit() {
        this.setSlideConfig();
    }

    ngOnDestroy() {
        this.swiperRef?.nativeElement.swiper.autoplay.stop();
    }

    /**
   * Sets the slide config like title and disables prev and next button
   */
    protected setSlideConfig() {

        // Slide to random first view
        const index = this.swiperRef?.nativeElement.swiper.activeIndex ?? 0;

        if (Array.isArray(this.advertWidgets) && this.advertWidgets != null && index in this.advertWidgets) {
            this.title = this.advertWidgets[index].title;
        } else {
            this.title = { rawTitle: environment.edgeShortName + " - App" };
        }

        // Determine whether to display rawTitle or not
        this.displayRawTitle = "rawTitle" in this.title;
        this.changeNextPrevButtons();
    }

    protected swipeNext() {
        this.swiperRef?.nativeElement.swiper.slideNext();
    }

    protected swipePrevious() {
        this.swiperRef?.nativeElement.swiper.slidePrev();
    }

    private changeNextPrevButtons() {

        // enables or disables nav buttons generally
        const length = this.swiperRef?.nativeElement.swiper.slides.length ?? 0;
        this.enableBtn = length > 1;

        // If more than one slide
        if (this.enableBtn) {
            const isBeginning = this.swiperRef?.nativeElement.swiper.isBeginning || false;
            const isEnd = this.swiperRef?.nativeElement.swiper.isEnd || false;
            this.disablePrevBtn = isBeginning;
            this.disableNextBtn = isEnd;
        }
    }

}
