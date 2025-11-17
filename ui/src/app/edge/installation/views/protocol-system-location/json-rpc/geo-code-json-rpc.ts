import { JsonrpcRequest, JsonrpcResponseSuccess } from "src/app/shared/jsonrpc/base";

export type GeoResult = {
    country: string,
    countryCode: string,
    currency: string,
    houseNumber: string,
    latitude: string,
    longitude: string,
    openStreetMapUrl: string,
    placeName: string,
    postcode: string,
    road: string,
    subdivision: string,
    subdivisionCode: string,
    timezone: string,
};

export namespace GeoCodeJsonRpc {

    export class Request extends JsonrpcRequest {
        private static METHOD: string = "geocode";

        public constructor(
            public override params: {
                query: string
            }
        ) {
            super(Request.METHOD, params);
        }
    }

    export class Response extends JsonrpcResponseSuccess {

        public constructor(
            public override readonly id: string,
            public override readonly result: {
                geocodingResults: GeoResult[],
            },
        ) {
            super(id, result);
        }

    }
}
