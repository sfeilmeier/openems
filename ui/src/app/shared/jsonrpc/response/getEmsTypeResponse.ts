import { EmsType } from "src/app/edge/installation/shared/ibndatatypes";
import { JsonrpcResponseSuccess } from "../base";

/**
 * Wraps a JSON-RPC Response for a GetEmsTypeRequest.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "result": {
 *     "emsType": EmsType
 *   }
 * }
 * </pre>
 */
export class GetEmsTypeResponse extends JsonrpcResponseSuccess {

    public constructor(
        public override readonly id: string,
        public override readonly result: {
            emsType: EmsType
        },
    ) {
        super(id, result);
    }
}
