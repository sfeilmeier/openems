import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";
import { States } from "src/app/shared/ngrx-store/states";
import { ObjectUtils } from "src/app/shared/utils/object/object-utils";

/**
 * <pre>
 * {
 *   "jsonrpc": "2.0",
 *   "id": UUID,
 *   "method": "getEstimatedConfiguration",
 *   "params": {
 *      "alias": string ,
        "appId": string ,
        "properties": {
        ...
        } ,
 *   }
 * }
 * </pre>
 */
export class GetEstimatedConfigRequest extends JsonrpcRequest {

    private static METHOD: string = "getEstimatedConfiguration";
    public override readonly params: {};
    protected override requiredState: States = States.EDGE_SELECTED;

    public constructor(
        params: {
            appId?: string,
            alias?: string,
            properties?: Record<string, any>,
        },
    ) {
        const sanitizedParams = params.properties != null
            ? { ...params, properties: ObjectUtils.omitNullOrUndefinedValues(params.properties) }
            : params;
        super(GetEstimatedConfigRequest.METHOD, sanitizedParams);
        this.params = sanitizedParams;
    }

}
