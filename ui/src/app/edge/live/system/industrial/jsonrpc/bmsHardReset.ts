import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * Wraps a JSON-RPC Request to hard reset the all BMS devices.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "bmsHardReset",
 *   "params": {}
 * }
 * </pre>
 */
export class BmsHardResetRequest extends JsonrpcRequest {

    private static METHOD: string = "bmsHardReset";

    public constructor(
    ) {
        super(BmsHardResetRequest.METHOD, {});
    }

}
