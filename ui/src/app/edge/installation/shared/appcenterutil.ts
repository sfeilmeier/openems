import { ComponentJsonApiRequest } from "src/app/shared/jsonrpc/request/componentJsonApiRequest";
import { Edge, Websocket } from "src/app/shared/shared";
import { ObjectUtils } from "src/app/shared/utils/object/object-utils";
import { AddAppInstance } from "../../settings/app/jsonrpc/addAppInstance";
import { DeleteAppInstance } from "../../settings/app/jsonrpc/deleteAppInstance";
import { GetAppInstances } from "../../settings/app/jsonrpc/getAppInstances";
import { UpdateAppInstance } from "../../settings/app/jsonrpc/updateAppInstance";
import { GridFeedInLimitationType } from "./enums";

export class AppCenterUtil {
    /**
     * Creates an instance with the given properties or updates the first found instance of the given appId.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param appId The Id of the app that should get created or updated
     * @param alias The alias of the new instance
     * @param properties The properties of the new instance
     * @returns A Promise of the new instance
     */
    public static createOrUpdateApp(
        edge: Edge,
        websocket: Websocket,
        appId: string,
        alias: string,
        properties: {},
        key: string,
    ): Promise<GetAppInstances.AppInstance> {
        return new Promise<GetAppInstances.AppInstance>((resolve, reject) => {
            AppCenterUtil.getAppInstances(edge, websocket, appId)
                .then((result) => {
                    // app already installed => update
                    if (result.result.instances.length > 0) {
                        // take first found instance e. g. a Home can only be instantiated
                        // once so there should only be one instance available
                        const alreadyExistingInstance = result.result.instances[0];
                        AppCenterUtil.updateApp(edge, websocket, alreadyExistingInstance.instanceId, alias, properties)
                            .then((response) => resolve(response.result.instance))
                            .catch((error) => reject(error));
                    } else {
                        AppCenterUtil.createAppInstance(edge, websocket, appId, alias, properties, key)
                            .then((response) => {
                                const result = response as AddAppInstance.Response;
                                resolve(result.result.instance);
                            })
                            .catch((error) => reject(error));
                    }
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Gets the Instance of the matching the given appId and instanceId.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param appId The AppId of the instance
     * @param instanceId The instanceId
     * @returns A Promise of the instance
     */
    public static getAppInstance(
        edge: Edge,
        websocket: Websocket,
        appId: string,
        instanceId: string,
    ): Promise<GetAppInstances.AppInstance> {
        return new Promise<GetAppInstances.AppInstance>((resolve, reject) => {
            AppCenterUtil.getAppInstances(edge, websocket, appId)
                .then((response) => {
                    const matchingIds = response.result.instances.filter((instance) => {
                        return instance.instanceId == instanceId;
                    });
                    if (matchingIds.length == 0) {
                        reject("Instance not found!");
                        return;
                    }
                    resolve(matchingIds[0]);
                })
                .catch((error) => {
                    reject(error);
                });
        });
    }

    /**
     * Gets all Instances of the given AppId.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param appId The AppId of the instances
     * @returns A Promise of GetAppInstances.Response
     */
    public static getAppInstances(edge: Edge, websocket: Websocket, appId: string): Promise<GetAppInstances.Response> {
        return new Promise<GetAppInstances.Response>((resolve, reject) => {
            edge.sendStateFullRequest(
                websocket,
                new ComponentJsonApiRequest({
                    componentId: "_appManager",
                    payload: new GetAppInstances.Request({
                        appId: appId,
                    }),
                }),
            )
                .then((response) => resolve(response as GetAppInstances.Response))
                .catch((error) => reject(error));
        });
    }

    /**
     * Deinstalls all instances of the given AppId.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param appId The AppId of the instances
     * @returns A Promise
     */
    public static removeInstancesOfApp(edge: Edge, websocket: Websocket, appId: string) {
        return new Promise((resolve, reject) => {
            AppCenterUtil.getAppInstances(edge, websocket, appId)
                .then((response) => {
                    if (!response.result.instances || response.result.instances.length == 0) {
                        resolve(response);
                        return;
                    }
                    const instanceIds: string[] = [];
                    response.result.instances.forEach((instance) => {
                        instanceIds.push(instance.instanceId);
                    });
                    this.removeInstances(edge, websocket, instanceIds)
                        .then((response) => resolve(response))
                        .catch((error) => reject(error));
                })
                .catch((error) => reject(error));
        });
    }

    /**
     * Deinstalls all instances that are given.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param instanceIds The instanceIds that should get deinstalled
     * @returns A Promise that resolves after every instance got deinstalled
     */
    public static removeInstances(edge: Edge, websocket: Websocket, instanceIds: string[]): Promise<any[]> {
        const promises: Promise<any>[] = [];
        instanceIds.forEach((instanceId) => {
            promises.push(
                edge.sendStateFullRequest(
                    websocket,
                    new ComponentJsonApiRequest({
                        componentId: "_appManager",
                        payload: new DeleteAppInstance.Request({
                            instanceId: instanceId,
                        }),
                    }),
                ),
            );
        });
        return Promise.all(promises);
    }

    /**
     * Updates an App Instance.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param instanceId The instance that should get updated
     * @param alias The alias of the updated instance
     * @param properties The properties of the updated instance
     * @returns A Promise of UpdateAppInstance.Response
     */
    public static updateApp(
        edge: Edge,
        websocket: Websocket,
        instanceId: string,
        alias: string,
        properties: {},
    ): Promise<UpdateAppInstance.Response> {
        return new Promise<UpdateAppInstance.Response>((resolve, reject) => {
            edge.sendStateFullRequest(
                websocket,
                new ComponentJsonApiRequest({
                    componentId: "_appManager",
                    payload: new UpdateAppInstance.Request({
                        instanceId: instanceId,
                        alias: alias,
                        properties: ObjectUtils.omitNullOrUndefinedValues(properties, (val) => !Number.isNaN(val)),
                    }),
                }),
            )
                .then((response) => resolve(response as UpdateAppInstance.Response))
                .catch((error) => reject(error));
        });
    }

    /**
     * Creates an App Instance.
     *
     * @param edge The edge
     * @param websocket The websocket connection
     * @param appId The AppId of the App that should get created
     * @param alias The alias of the new instance
     * @param properties The propertes of the new instance
     * @returns A Promise of AddAppInstance.Response
     */
    public static createAppInstance(
        edge: Edge,
        websocket: Websocket,
        appId: string,
        alias: string,
        properties: {},
        key: string,
    ): Promise<AddAppInstance.Response> {
        return new Promise<AddAppInstance.Response>((resolve, reject) => {
            edge.sendStateFullRequest(
                websocket,
                new ComponentJsonApiRequest({
                    componentId: "_appManager",
                    payload: new AddAppInstance.Request({
                        key: key,
                        appId: appId,
                        alias: alias,
                        properties: ObjectUtils.omitNullOrUndefinedValues(properties, (val) => !Number.isNaN(val)),
                    }),
                }),
            )
                .then((response) => resolve(response as AddAppInstance.Response))
                .catch((error) => reject(error));
        });
    }

    // TODO this key will probably removed with a separate request for installing integrated systems
    public static keyForIntegratedSystems(): string {
        return "0000-0000-0000-0001";
    }

    /**
     * Updates GRID_FEED_IN_LIMITATION settings in App.Core.Meta and then ensures the given app is created or updated.
     *
     * @param edge The edge
     * @param websocket The websocket
     * @param appId The appId to create or update after updating Meta
     * @param alias The alias for the app
     * @param properties Properties for the app to create/update
     * @param dynamicLimitationType The limitationType
     * @param maximumFeedInPower The maximum feed in power
     */
    public static updateMetaAndInstallApp(
        edge: Edge,
        websocket: Websocket,
        appId: string,
        alias: string,
        properties: {},
        dynamicLimitationType: GridFeedInLimitationType,
        maximumFeedInPower: number,
    ): Promise<any> {
        return AppCenterUtil.getAppInstances(edge, websocket, "App.Core.Meta")
            .then((response) => {
                const instance = response?.result?.instances[0] ?? null;
                if (instance == null) {
                    return Promise.reject("App.Core.Meta instance not found");
                }

                // patch properties
                instance.properties["GRID_FEED_IN_LIMITATION_TYPE"] = dynamicLimitationType;
                instance.properties["MAXIMUM_GRID_FEED_IN_LIMIT"] = maximumFeedInPower;

                return AppCenterUtil.updateApp(edge, websocket, instance.instanceId, instance.alias, {
                    ...instance.properties,
                });
            })
            .finally(() => {
                return AppCenterUtil.createOrUpdateApp(
                    edge,
                    websocket,
                    appId,
                    alias,
                    properties,
                    AppCenterUtil.keyForIntegratedSystems(),
                );
            });
    }
}
