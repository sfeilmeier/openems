import { Language } from "src/app/shared/type/language";
import { environment } from "src/environments";

export enum WebLinks {
    WARRANTY_LINK_HOME,
    WARRANTY_LINK_COMMERCIAL_50_GEN3,
    WARRANTY_LINK_COMMERCIAL_92,
    WARRANTY_LINK_COMMERCIAL_100,
}

export namespace WebLinkUtils {
    export function getLink(link: WebLinks): string {
        const lang: string = Language.getByKey(localStorage.LANGUAGE)?.key ?? Language.DEFAULT.key;

        switch (link) {
            case WebLinks.WARRANTY_LINK_HOME:
                switch (lang) {
                    case "en":
                        return environment.links.REDIRECT.WARRANTY.HOME_GUARANTEE_CONDITIONS.EN;
                    case "de":
                    default:
                        return environment.links.REDIRECT.WARRANTY.HOME_GUARANTEE_CONDITIONS.DE;
                }
            case WebLinks.WARRANTY_LINK_COMMERCIAL_50_GEN3:
                switch (lang) {
                    case "en":
                        return environment.links.REDIRECT.WARRANTY.COMMERCIAL_50_GEN3_GUARANTEE_CONDITIONS.EN;
                    case "de":
                    default:
                        return environment.links.REDIRECT.WARRANTY.COMMERCIAL_50_GEN3_GUARANTEE_CONDITIONS.DE;
                }
            case WebLinks.WARRANTY_LINK_COMMERCIAL_92:
                switch (lang) {
                    case "en":
                        return environment.links.REDIRECT.WARRANTY.COMMERCIAL_92_GUARANTEE_CONDITIONS.EN;
                    case "de":
                    default:
                        return environment.links.REDIRECT.WARRANTY.COMMERCIAL_92_GUARANTEE_CONDITIONS.DE;
                }
            case WebLinks.WARRANTY_LINK_COMMERCIAL_100:
                switch (lang) {
                    case "en":
                        return environment.links.REDIRECT.WARRANTY.COMMERCIAL_100_GUARANTEE_CONDITIONS.EN;
                    case "de":
                    default:
                        return environment.links.REDIRECT.WARRANTY.COMMERCIAL_100_GUARANTEE_CONDITIONS.DE;
                }
            default:
                return environment.links.REDIRECT.WARRANTY.HOME_GUARANTEE_CONDITIONS.DE;
        }
    }
}

