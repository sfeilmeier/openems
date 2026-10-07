import { EdgeAppInstanceNotFoundError, GenericError } from "src/app/shared/errors/errors";
import { JsonrpcResponseError } from "src/app/shared/jsonrpc/base";
import { AppCenterUtil } from "./appcenterutil";

describe("AppCenterUtil", () => {
    describe("#isInstanceNotFoundError", () => {
        const jsonrpcError = (code: number, message: string) => new JsonrpcResponseError("id", { code, message });

        it("matches the structured Edge error code", () => {
            expect(
                AppCenterUtil.isInstanceNotFoundError(
                    jsonrpcError(EdgeAppInstanceNotFoundError.id, "Unable to find App instance with ID [1234]"),
                ),
            ).toBeTrue();
        });

        it("matches the plain-text Edge error sent with the generic code", () => {
            expect(
                AppCenterUtil.isInstanceNotFoundError(
                    jsonrpcError(GenericError.id, "Unable to find instance with id '1234'"),
                ),
            ).toBeTrue();
        });

        it("matches the message of an Error or string", () => {
            expect(
                AppCenterUtil.isInstanceNotFoundError(new Error("Unable to find instance with id '1234'")),
            ).toBeTrue();
            expect(AppCenterUtil.isInstanceNotFoundError("Unable to find App instance with ID [1234]")).toBeTrue();
        });

        it("does not match other errors", () => {
            expect(AppCenterUtil.isInstanceNotFoundError(jsonrpcError(GenericError.id, "Something broke"))).toBeFalse();
            expect(AppCenterUtil.isInstanceNotFoundError(new Error("Websocket request timed out"))).toBeFalse();
            expect(AppCenterUtil.isInstanceNotFoundError(null)).toBeFalse();
        });
    });
});
