import { format } from "date-fns";
import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * Requests a battery-capacity extension simulation.
 *
 * ```json
 * {
 *     "id": "UUID",
 *     "jsonrpc": "2.0",
 *     "method": "possibleBatteryCapacityExtension",
 *     "params": {
 *         "fromDate": "2025-10-12",
 *         "toDate": "2026-10-12",
 *         "electricityPrice": 0.3
 *     }
 * }
 * ```
 */
export class PossibleBatteryExtensionRequest extends JsonrpcRequest {
    private static METHOD: string = "possibleBatteryCapacityExtension";

    public constructor(fromDate: Date, toDate: Date, electricityPrice: number) {
        super(PossibleBatteryExtensionRequest.METHOD, {
            fromDate: format(fromDate, "yyyy-MM-dd"),
            toDate: format(toDate, "yyyy-MM-dd"),
            electricityPrice: electricityPrice,
        });
    }
}
