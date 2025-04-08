import { JsonrpcRequest, JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";

/**
 * Represents a JSON-RPC Request for 'getConnectionState'.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "getConnectionState",
 *   "params": {}
 * }
 * </pre>
 *
 * <p>
 * Response:
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": "UUID",
 *   "result": {
 *      connectionState: string
 *    }
 * }
 * </pre>
 */
export namespace GetConnectionState {

    export const METHOD: string = "getConnectionState";

    export class Request extends JsonrpcRequest {

        public constructor(
        ) {
            super(METHOD, {});
        }
    }

    export class Response extends JsonrpcResponseSuccess {

        public constructor(
            public override readonly id: string,
            public override readonly result: {
                connectionState: string
            },
        ) {
            super(id, result);
        }
    }

}
