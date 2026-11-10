import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * Represents a JSON-RPC Request to get the EmsType.
 *
 * This is used by UI to get the EmsType.
 *
 * ```json
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "getEmsType",
 *   "params": {
 *    "edgeId": string
 *   }
 * }
 * ```
 */
export class GetEmsTypeRequest extends JsonrpcRequest {
    private static METHOD: string = "getEmsType";

    public constructor(
        public override readonly params: {
            edgeId: string;
        },
    ) {
        super(GetEmsTypeRequest.METHOD, params);
    }
}
