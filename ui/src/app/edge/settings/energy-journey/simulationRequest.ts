import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * <pre>
 * {
 *  "jsonrpc": "2.0",
 *  "id": UUID,
 *  "method": "simulation",
 *  "params": {}
 * }
 * </pre>
 */
export class SimulationRequest extends JsonrpcRequest {

    private static METHOD: string = "simulation";

    public constructor(
        public override readonly params: {},
    ) {
        super(SimulationRequest.METHOD, params);
    }
}
