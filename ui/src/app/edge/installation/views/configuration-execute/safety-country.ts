import { Country } from "src/app/shared/type/country";

export enum SafetyCountry {
    GERMANY = "GERMANY",
    AUSTRIA = "AUSTRIA",
    SWITZERLAND = "SWITZERLAND",
    SWEDEN = "SWEDEN",
    CZECH_REPUBLIK = "CZECH",
    NETHERLANDS = "HOLLAND",
    GREECE_MAINLAND = "GREECE_MAINLAND",
}

export namespace SafetyCountry {
    export function getSafetyCountry(countryValue: Country) {
        switch (countryValue) {
            case Country.GERMANY:
            case Country.LITHUANIA:
                // For FENECON Home battery inverter, Lithuania is not (yet) supported as safety country. "GERMANY" is configured instead.
                return SafetyCountry.GERMANY;
            case Country.AUSTRIA:
                return SafetyCountry.AUSTRIA;
            case Country.SWITZERLAND:
                return SafetyCountry.SWITZERLAND;
            case Country.CZECH_REPUBLIC:
                return SafetyCountry.CZECH_REPUBLIK;
            case Country.NETHERLANDS:
                return SafetyCountry.NETHERLANDS;
            case Country.SWEDEN:
                return SafetyCountry.SWEDEN;
            case Country.GREECE:
                return SafetyCountry.GREECE_MAINLAND;
        }
    }
}
