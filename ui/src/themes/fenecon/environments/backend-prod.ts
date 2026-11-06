import { provideMatomo, withPageUrlProvider, withRouter } from "ngx-matomo-client";
import { of } from "rxjs";
import { Environment } from "src/environments";
import { theme } from "./theme";

export const environment: Environment = {
    ...theme,
    ...{
        backend: "OpenEMS Backend",
        url: "wss://portal.fenecon.de/openems-backend-ui2",

        production: true,
        debugMode: false,

        ENVIRONMENT_PROVIDERS: [
            ...theme.ENVIRONMENT_PROVIDERS,
            // Activate tracking only in production
            provideMatomo(
                {
                    trackerUrl: "https://tracking.fenecon.de",
                    siteId: 4,
                },
                withRouter({ trackPageTitle: false }),
                withPageUrlProvider((event) => {
                    // Hide specific device number for data privacy reasons.
                    return of(event.urlAfterRedirects.replace(/ems\d+/g, "ems"));
                }),
            ),
        ],
    },
};
