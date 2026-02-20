import { JsonrpcRequest } from "../../../../../shared/jsonrpc/base";
/**
 * JSON-RPC request to clear errors.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "clearErrorRequest",
 *   "params": {
 *     "componentId": string,
 *     "payload": JsonrpcRequest
 *   }
 * }
 * </pre>
 */
export class ClearErrorRequest extends JsonrpcRequest {

    private static METHOD: string = "clearErrorRequest";

    public constructor(
    ) {
        super(ClearErrorRequest.METHOD, {});
    }

}
