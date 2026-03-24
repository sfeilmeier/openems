import { TranslateService } from "@ngx-translate/core";
import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { Edge, EdgeConfig, Service, Websocket } from "src/app/shared/shared";
import { AssertionUtils } from "src/app/shared/utils/assertions/assertions.utils";

export class SystemIndustrialJsonRpcHelper {

    public static executeRpcRequest(
        service: Service,
        translate: TranslateService,
        websocket: Websocket,
        request: ComponentJsonApiRequest,
        edge: Edge | null
    ): Promise<void> {

        AssertionUtils.assertIsDefined(edge);

        return edge.sendRequest(websocket, request)
            .then(() => {
                service.toast(
                    translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.RPC_SUCCESS"),
                    "success"
                );
            })
            .catch((reason) => {
                const message = reason?.error?.message ?? "";
                service.toast(
                    translate.instant("EDGE.INDEX.WIDGETS.SYSTEM.RPC_FAILED") +
                    (message ? "\n" + message : ""),
                    "danger"
                );
            });
    }

    public static createRpcCallback(
        service: Service,
        translate: TranslateService,
        websocket: Websocket,
        edge: Edge | null,
        component: EdgeConfig.Component | null,
        payload: any
    ): () => void {

        return () => {

            AssertionUtils.assertIsDefined(edge);
            AssertionUtils.assertIsDefined(component);

            SystemIndustrialJsonRpcHelper.executeRpcRequest(
                service,
                translate,
                websocket,
                new ComponentJsonApiRequest({
                    componentId: component.id,
                    payload,
                }),
                edge
            );
        };
    }
}
