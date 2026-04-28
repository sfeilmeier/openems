import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * Wraps a JSON-RPC Request for an OpenEMS Component that implements JsonApi
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "f2bUpdate",
 *   "params": {}
 * }
 * </pre>
 */
export class F2BUpdate extends JsonrpcRequest {

    private static METHOD: string = "f2bUpdate";

    public constructor(
    ) {
        super(F2BUpdate.METHOD, {});
    }

}
