import { JsonrpcResponseSuccess } from "../base";

/**
 * Wraps a JSON-RPC Response for a GetEmsTypeRequest.
 *
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "result": {
 *     "emsType": 'feh013' | 'fho011' | undefined
 *   }
 * }
 * </pre>
 */
export class GetEmsTypeResponse extends JsonrpcResponseSuccess {

    public constructor(
        public override readonly id: string,
        public override readonly result: {
            emsType: "feh013" | "fho011" | undefined
        },
    ) {
        super(id, result);
    }
}
