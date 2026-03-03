import { Language } from "src/app/shared/type/language";
import { environment } from "src/environments";

export enum WebLinks {
    WARRANTY_LINK_HOME,
    WARRANTY_LINK_COMMERCIAL,
}

export namespace WebLinkUtils {
    export function getLink(link: WebLinks): string {
        const lang: string = Language.getByKey(localStorage.LANGUAGE)?.key ?? Language.DEFAULT.key;
        switch (link) {
            case WebLinks.WARRANTY_LINK_HOME:
                switch (lang) {
                    case "de":
                    default:
                        return environment.links.WARRANTY.HOME.DE;
                    case "en":
                        return environment.links.WARRANTY.HOME.EN;
                }
            case WebLinks.WARRANTY_LINK_COMMERCIAL:
                switch (lang) {
                    case "de":
                    default:
                        return environment.links.WARRANTY.COMMERCIAL.DE;
                    case "en":
                        return environment.links.WARRANTY.COMMERCIAL.EN;
                }
        }
    }
}
