import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "method": "getEstimatedConfiguration",
 *   "params": {
 *      "alias": string ,
        "appId": string ,
        "properties": {
        ...
        } ,
 *   }
 * }
 * </pre>
 */
export class GetEstimatedConfigRequest extends JsonrpcRequest {

    private static METHOD: string = "getEstimatedConfiguration";

    public constructor(
        public override readonly params: {
        },
    ) {
        super(GetEstimatedConfigRequest.METHOD, params);
    }

}
