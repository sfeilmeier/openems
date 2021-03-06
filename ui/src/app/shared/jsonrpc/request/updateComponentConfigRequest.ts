import { JsonrpcRequest } from "../base";

/**
 * Represents a JSON-RPC Request to update the configuration of an OpenEMS Edge Component.
 * 
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "method": "updateComponentConfig",
 *   "params": {
 *     "componentId": string,
 *     "update": [
 *       "property": string,
 *       "value": any
 *     ]
 *   }
 * }
 * </pre>
 */
export class UpdateComponentConfigRequest extends JsonrpcRequest {

    static METHOD: string = "updateComponentConfig";

    public constructor(
        public readonly componentId: string,
        public readonly update: [{
            property: string,
            value: any
        }]
    ) {
        super(UpdateComponentConfigRequest.METHOD, {
            componentId: componentId,
            update: update
        });
    }

}