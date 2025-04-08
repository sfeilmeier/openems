import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "method": "authenticateToRemoteEdge",
 *   "params": {
 *      "setupKey": string ,
 *   }
 * }
 * </pre>
 */
export class AuthenticateRemoteEdgeRequest extends JsonrpcRequest {

    private static METHOD: string = "authenticateToRemoteEdge";

    public constructor(
        public override readonly params: {
            setupKey: string,
        },
    ) {
        super(AuthenticateRemoteEdgeRequest.METHOD, params);
    }

}
