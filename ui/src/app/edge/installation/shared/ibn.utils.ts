// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { Interface } from "src/app/shared/interface/interface";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { Edge, Websocket } from "src/app/shared/shared";
import { COUNTRY_OPTIONS } from "src/app/shared/type/country";
import { GetNetworkConfigRequest } from "../../settings/network/getNetworkConfigRequest";
import { GetNetworkConfigResponse } from "../../settings/network/getNetworkConfigResponse";
import { SetNetworkConfigRequest } from "../../settings/network/setNetworkConfigRequest";
import { NetworkUtils } from "../../settings/network/shared";
import { AbstractIbn } from "../installation-systems/abstract-ibn";
import { Category } from "./category";
import { ComponentData } from "./ibndatatypes";

export class IbnUtils {

    /**
     * Adds the IBN data to session storage safely.
     * This mehtod is specifically implemented to deal with "cyclic object value" exception, which is caused due to Object reference.
     *
     * @param ibn The IBN
     */
    public static addIbnToSessionStorage(ibn: AbstractIbn) {
        sessionStorage.setItem("ibn", JSON.stringify(ibn, (key, value) => {
            // Do not stringify the translate service
            if (key === "translate") {
                return undefined;
            }
            return value;
        }));
    }

    /**
     * Adds an ip address to the given interface.
     * Returns false if an error occurs.
     *
     * @param interfaceName Interface default 'eth0'
     * @param ip Ip that should be added
     * @param edge the current edge.
     * @param websocket the websocket connection.
     * @returns the status of adding ip address as boolean.
     */
    public static addIpAddress(interfaceName: string, ip: string, edge: Edge, websocket: Websocket) {
        let iface: Interface;

        edge.sendStateFullRequest(
            websocket,
            new ComponentJsonApiRequest({ componentId: "_host", payload: new GetNetworkConfigRequest() }),
        ).then((response) => {
            const result = (response as GetNetworkConfigResponse).result;

            // Get interface
            for (const name of Object.keys(result.interfaces)) {
                if (name === interfaceName) {
                    iface = { name, model: result.interfaces[name] };
                }
            }

            // No interface with given name found
            if (!iface) {
                console.log("Network interface with name ''" + interfaceName + "'' was not found.");
                return false;
            }

            // Unset Gateway and DNS if DHCP is activated
            if (iface.model.dhcp) {
                iface.model.gateway = null;
                iface.model.dns = null;
            }

            // Set the ip in the model of the interface
            // or return if it already exists
            const [address, subnet] = ip.split("/");

            if ("addresses" in iface.model) {
                for (const addr of iface.model.addresses) {
                    if (addr.address == address) {
                        return true;
                    }
                }

                iface.model.addresses.push({
                    label: "",
                    address: address,
                    subnetmask: NetworkUtils.getSubnetmaskAsString(Number.parseInt(subnet)),
                });

            } else {
                iface.model.addresses = new Array({
                    label: "",
                    address: address,
                    subnetmask: NetworkUtils.getSubnetmaskAsString(Number.parseInt(subnet)),
                });
            }

            const params = {
                interfaces: {},
            };
            params.interfaces[iface.name] = iface.model;

            edge.sendStateFullRequest(
                websocket,
                new ComponentJsonApiRequest({ componentId: "_host", payload: new SetNetworkConfigRequest(params) }),
            ).then(() => true).catch((reason) => {
                console.log(reason);
            });
        }).catch(reason => {
            console.log(reason);
        });
        return false;
    }

    /**
   * Returns the country label selected.
   *
   * @param countryValue the country value.
   * @param translate the Translate service.
   * @returns country label.
   */
    public static getCountryLabel(countryValue: string, translate: TranslateService) {
        return COUNTRY_OPTIONS(translate).find((country) => country.value === countryValue)?.label ?? "";
    }

    /**
 * Fills data based on the provided category.
 *
 * @param data  The data object containing information to be filled.
 * @param category The category determining which data fields to include.
 * @returns An array of ComponentData objects filled based on the provided data and category.
 */
    public static fillData(data: any, category: Category.CUSTOMER | Category.INSTALLER | Category.BATTERY_LOCATION, translate: TranslateService): ComponentData[] {
        const rows: ComponentData[] = [];

        if ((category === Category.CUSTOMER && data.isCorporateClient) || (category === Category.INSTALLER)) {
            rows.push({ label: translate.instant("REGISTER.FORM.COMPANY"), value: data.companyName });
        }

        rows.push(
            { label: translate.instant("REGISTER.FORM.LASTNAME"), value: data.lastName },
            { label: translate.instant("REGISTER.FORM.FIRSTNAME"), value: data.firstName },
            { label: translate.instant("REGISTER.FORM.STREET"), value: data.street },
            { label: translate.instant("REGISTER.FORM.ZIP"), value: data.zip },
            { label: translate.instant("REGISTER.FORM.CITY"), value: data.city },
            { label: translate.instant("REGISTER.FORM.COUNTRY"), value: IbnUtils.getCountryLabel(data.country, translate) },
            { label: translate.instant("REGISTER.FORM.EMAIL"), value: data.email },
        );

        if (data.phone) {
            rows.push({ label: translate.instant("REGISTER.FORM.PHONE"), value: data.phone });
        }

        return rows;
    }

    /**
     * Removes the specified prefix from the beginning of the given serial number.
     * If the prefix is not present at the start, the original serial number is returned unchanged.
     *
     * @param serialNumber The serial number from which the prefix should be removed.
     * @param prefix The prefix to be removed.
     * @returns The serial number without the prefix if it starts with it, otherwise the original serial number.
     *
     * @example
     * ```typescript
     * const result1 = ProtocolAvuBoxComponent.removePrefix("FHA12345", "FHA");
     * Output: "12345"
     *
     * const result2 = ProtocolAvuBoxComponent.removePrefix("XYZ789", "FHA");
     * Output: "XYZ789"
     * ```
     */
    public static removePrefix(serialNumber: string, prefix: string): string {
        return serialNumber.startsWith(prefix) ? serialNumber.slice(prefix.length) : serialNumber;
    }
}
