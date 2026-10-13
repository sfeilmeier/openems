import { Service } from "@angular/core";

/**
 * Shared, injectable state/behaviour for the installation module (views under `edge/installation/`).
 */
@Service({ autoProvided: false })
export class InstallationService {

    /** In-flight promises created via {@link dedupe}, keyed by the caller-supplied key. */
    private readonly pendingRequests = new Map<string, Promise<unknown>>();

    /**
     * Deduplicates concurrent async calls for the same key: reuses an already in-flight {@link Promise} instead of
     * creating a duplicate/concurrent one, e.g. to avoid triggering a backend race condition on repeated calls
     * (such as "temporaryApps is null"). Once a promise settles, its key is freed so a later call starts a fresh
     * request.
     *
     * @param key Identifies the request, e.g. combining an edge id with the request type.
     * @param factory Creates the promise to run/reuse for this key.
     * @returns The shared in-flight promise for this key.
     */
    public dedupe<T>(key: string, factory: () => Promise<T>): Promise<T> {
        const existing = this.pendingRequests.get(key);
        if (existing) {
            return existing as Promise<T>;
        }
        const request = factory().finally(() => this.pendingRequests.delete(key));
        this.pendingRequests.set(key, request);
        return request;
    }
}
