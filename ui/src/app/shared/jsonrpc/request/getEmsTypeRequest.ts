import { JsonrpcRequest } from "../base";

/**
 * Represents a JSON-RPC Request to get the EmsType.
 *
 * <p>
 * This is used by UI to get the EmsType.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "getEmsType",
 *   "params": {
 *    "edgeId": string
 *   }
 * }
 * </pre>
 */
export class GetEmsTypeRequest extends JsonrpcRequest {

    private static METHOD: string = "getEmsType";

    public constructor(
        public override readonly params: {
            edgeId: string
        },
    ) {
        super(GetEmsTypeRequest.METHOD, params);
    }

}
