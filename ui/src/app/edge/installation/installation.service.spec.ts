import { InstallationService } from "./installation.service";

describe("InstallationService", () => {
    let service: InstallationService;

    beforeEach(() => {
        service = new InstallationService();
    });

    describe("#dedupe", () => {
        it("reuses the in-flight promise for the same key", async () => {
            let resolveRequest: (value: string) => void = () => {};
            const factory = jasmine
                .createSpy("factory")
                .and.callFake(() => new Promise<string>((resolve) => (resolveRequest = resolve)));

            const first = service.dedupe("key", factory);
            const second = service.dedupe("key", factory);
            resolveRequest("result");

            expect(factory).toHaveBeenCalledTimes(1);
            expect(await first).toBe("result");
            expect(await second).toBe("result");
        });

        it("runs separate requests for different keys", async () => {
            const factory = jasmine.createSpy("factory").and.callFake(() => Promise.resolve("result"));

            await Promise.all([service.dedupe("key-a", factory), service.dedupe("key-b", factory)]);

            expect(factory).toHaveBeenCalledTimes(2);
        });

        it("starts a fresh request once the previous one resolved", async () => {
            const factory = jasmine.createSpy("factory").and.callFake(() => Promise.resolve("result"));

            await service.dedupe("key", factory);
            await service.dedupe("key", factory);

            expect(factory).toHaveBeenCalledTimes(2);
        });

        it("starts a fresh request once the previous one rejected", async () => {
            const factory = jasmine
                .createSpy("factory")
                .and.returnValues(Promise.reject(new Error("failed")), Promise.resolve("result"));

            await expectAsync(service.dedupe("key", factory)).toBeRejectedWithError("failed");
            expect(await service.dedupe("key", factory)).toBe("result");
            expect(factory).toHaveBeenCalledTimes(2);
        });
    });
});
