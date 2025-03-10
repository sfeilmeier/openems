import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";

/**
 * Represents a JSON-RPC Response for a {@link GetEstimatedConfigRequest}.
 *
 * <pre>
 * {
 *  "jsonrpc": "2.0",
 *  "id": UUID,
 *  "result": {
 *      "components": {
 *          alias: string,
 *          factoryId: string,
 *          id: string,
 *          properties: { }
 *      }[],
 *  }
 * }
 * </pre>
 */
export class GetEstimatedConfigResponse extends JsonrpcResponseSuccess {

    public constructor(
        public override readonly id: string,
        public override readonly result: {
            configurations: [
                {
                    type: "StaticIp",
                    configuration: {
                        ips: {
                            interface: {
                                address: string,
                            }[],
                        }[],
                    },
                },
                {
                    type: "Component",
                    configuration: {
                        components: {
                            alias: string,
                            factoryId: string,
                            id: string,
                            properties: {
                            }
                        }[],
                    }
                },
                {
                    type: "SchedulerByCentralOrder",
                    configuration: {
                        insertOrder: {
                            id: string,
                            factoryId: string,
                            createdByAppId: string,
                        }
                    }
                },
            ],
        },
    ) {
        super(id, result);
    }
}
