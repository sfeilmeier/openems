import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * Wraps a JSON-RPC Request for an OpenEMS Component that implements JsonApi
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "systemErrorAcknowledge",
 *   "params": {}
 * }
 * </pre>
 */
export class SystemErrorAcknowledge extends JsonrpcRequest {

    private static METHOD: string = "systemErrorAcknowledge";

    public constructor(
    ) {
        super(SystemErrorAcknowledge.METHOD, {});
    }

}
