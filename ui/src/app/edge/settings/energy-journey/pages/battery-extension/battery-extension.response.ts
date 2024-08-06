import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";
import { SimulatedData } from "./battery-extension.module";

/**
 * Wraps a JSON-RPC Response for a GetEdgeRequest.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "result": {
 *     "edge": Edge
 *   }
 * }
 * </pre>
 */
export class PossibleBatteryExtensionResponse extends JsonrpcResponseSuccess {

    public constructor(
        public override readonly id: string,
        public override readonly result: SimulatedData,
    ) {
        super(id, result);
    }
}
