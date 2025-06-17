import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * Wraps a JSON-RPC Request for an OpenEMS Component that implements JsonApi
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "clearTimeoutFailure",
 *   "params": {}
 * }
 * </pre>
 */
export class ClearTimeOutFailureRequest extends JsonrpcRequest {

    private static METHOD: string = "clearTimeoutFailure";

    public constructor(
    ) {
        super(ClearTimeOutFailureRequest.METHOD, {});
    }

}
