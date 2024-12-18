// @ts-strict-ignore
import { format } from "date-fns";
import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";

/**
 * <pre>
 * {
 *  "jsonrpc": "2.0",
 *  "id": UUID,
 *  "method": "possibleBatteryCapacityExtension",
 *  "params": {
 *     "fromDate": Date,
 *     "toDate": Date,
 *     "electricityPrice": number
 *  }
 * }
 * </pre>
 */
export class PossibleBatteryExtensionRequest extends JsonrpcRequest {

  private static METHOD: string = "possibleBatteryCapacityExtension";

  public constructor(
    private fromDate: Date,
    private toDate: Date,
    private electricityPrice: number,
  ) {
    super(PossibleBatteryExtensionRequest.METHOD, {
      fromDate: format(fromDate, "yyyy-MM-dd"),
      toDate: format(toDate, "yyyy-MM-dd"),
      electricityPrice: electricityPrice,
    });

    delete this.fromDate;
    delete this.toDate;
    delete this.electricityPrice;
  }

}
