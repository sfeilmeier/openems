import { JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";
import { EmsType } from "../shared/ibndatatypes";

/**
 * Wraps a JSON-RPC Response for a GetEmsTypeRequest.
 *
 * ```json
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "result": {
 *     "emsType": EmsType
 *   }
 * }
 * ```
 */
export class GetEmsTypeResponse extends JsonrpcResponseSuccess {
    public constructor(
        public override readonly id: string,
        public override readonly result: {
            emsType: EmsType;
        },
    ) {
        super(id, result);
    }
}
