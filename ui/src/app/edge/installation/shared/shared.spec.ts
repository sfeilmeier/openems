import { IbnUtils } from "./ibn.utils";

describe("#removePrefix", () => {
    const prefix = "FHA";

    const testCases = [
        { input: "FHA12345", prefix, expected: "12345" }, // Standard case
        { input: "12345FHA", prefix, expected: "12345FHA" }, // Prefix is in the middle, should return as is
        { input: "XYZ789", prefix, expected: "XYZ789" }, // No prefix at all, return as is
        { input: "FHA", prefix, expected: "" }, // Only prefix, should return empty string
        { input: "", prefix, expected: "" }, // Empty input should return empty
        { input: "FHA123FHA789", prefix, expected: "123FHA789" }, // Only first "FHA" should be removed
        { input: "ABC123", prefix: "ABC", expected: "123" }, // Works with different prefixes
        { input: "123ABC", prefix: "ABC", expected: "123ABC" }, // "ABC" is at the end, return as is
    ];

    testCases.forEach(({ input, prefix, expected }) => {
        it(`#removePrefix should correctly process '${input}' with prefix '${prefix}'`, () => {
            expect(IbnUtils.removePrefix(input, prefix)).toEqual(expected);
        });
    });
});
