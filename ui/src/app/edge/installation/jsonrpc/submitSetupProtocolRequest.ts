// @ts-strict-ignore
import { TranslateService } from "@ngx-translate/core";
import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";
import { Utils } from "src/app/shared/shared";
import { States } from "src/app/shared/states/states";
import { Category } from "../shared/category";

export type SetupProtocol = {
    fems: {
        id: string;
    };
    installer: {
        firstname: string;
        lastname: string;
    };
    customer: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        address: {
            street: string;
            city: string;
            zip: string;
            country: string;
        };
        company?: {
            name: string;
        };
    };
    location?: {
        firstname: string;
        lastname: string;
        email: string;
        phone: string;
        address: {
            street: string;
            city: string;
            zip: string;
            country: string;
        };
        company?: {
            name: string;
        };
    };
    lots?: {
        category: string;
        name: string;
        serialNumber: string;
    }[];
    items?: {
        category: any; // TODO is Category or string
        name: string;
        value: string;
    }[];
    oem: string;
};

/**
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "method": "submitSetupProtocol",
 *   "params": {
 *      protocol: {
 *          fems: {
 *              id: string
 *          },
 *          customer: {
 *              firstname: string,
 *              lastname: string,
 *              email: string,
 *              phone: string,
 *              address: {
 *                  street: string,
 *                  city: string,
 *                  zip: string,
 *                  country: string
 *              },
 *              company?: {
 *                  name: string
 *              }
 *          },
 *          location?: {
 *              firstname: string,
 *              lastname: string,
 *              email: string,
 *              phone: string,
 *              address: {
 *                  street: string,
 *                  city: string,
 *                  zip: string,
 *                  country: string
 *              },
 *              company?: {
 *                  name: string
 *              }
 *          },
 *          lots?: {
 *              category: string,
 *              name: string,
 *              serialNumber: string
 *          }[],
 *          items?: {
 *              category: Category,
 *              name: string,
 *              value: string
 *          }[],
 *          oem: string
 *      }
 *  }
 * </pre>
 */
export class SubmitSetupProtocolRequest extends JsonrpcRequest {
    private static METHOD: string = "submitSetupProtocol";
    protected override requiredState: States = States.EDGE_SELECTED;

    private constructor(
        public override readonly params: {
            protocol: any;
        },
    ) {
        super(SubmitSetupProtocolRequest.METHOD, params);
    }

    public static translateFrom(protocol: SetupProtocol, translate: TranslateService): SubmitSetupProtocolRequest {
        // protocol.items are type category in the protocol recieved and need to be translated before the request being sent.
        const items: {
            category: string;
            name: string;
            value: string;
        }[] = protocol.items.map((element) => {
            return {
                category: Category.toTranslatedString(element.category, translate),
                name: element.name,
                value: element.value,
            };
        });

        // 'Deep copy' to copy the object values from protocol recieved.
        // To avoid type issues from category to string.
        const protocolTranslated = Utils.deepCopy(protocol);
        protocolTranslated.items = items;

        return new SubmitSetupProtocolRequest({ protocol: protocolTranslated });
    }
}
