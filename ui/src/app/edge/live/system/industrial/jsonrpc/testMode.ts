import { JsonrpcRequest } from "src/app/shared/jsonrpc/base";
import { TestModeType } from "./testModeType";

/**
 * Wraps a JSON-RPC Request to start a system test mode with specific action and
 * argument.
 *
 * @typedef {"jsonrpc": "2.0",
 *   "id": "UUID",
 *   "method": "testMode",
 *   "params": {
 *     "action": {"type":"essTest"},
 *     "argument": ""
 *   }} JSON-RPC
 *   Request
 *
 * @typedef {"jsonrpc": "2.0",
 *   "id": "UUID",
 *   "result": {
 *     "status": "started",
 *     "message": null,
 *     "action": {"type": "essTest"}
 *   }} Successful
 *   Response
 *
 * @typedef {"jsonrpc": "2.0",
 *   "id": "UUID",
 *   "result": {
 *     "status": "ignored",
 *     "message": "A test is already running: essTest",
 *     "action": {"type":"essTest"}
 *   }} Ignored
 *   Response (e.g. if a test is already running):
 */
export class TestMode extends JsonrpcRequest {
    private static readonly METHOD: string = "testMode";

    public constructor(mode: TestModeType) {
        super(TestMode.METHOD, {
            action: {
                type: mode,
            },
        });
    }
}
