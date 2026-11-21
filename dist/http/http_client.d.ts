declare class InterceptorManager<T> {
    private handlers;
    use(fulfilled: Interceptor<T>['fulfilled'], rejected?: Interceptor<T>['rejected']): number;
    eject(id: number): void;
    run(value: T): Promise<T>;
    runError(error: any): Promise<any>;
}
/**function axioscomputeBackoff1(attempt: number, opts: Required<Pick<axiosRetryConfig, 'base' | 'factor' | 'max'>>): number {
    const raw = Math.min(opts.max, opts.base * Math.pow(opts.factor, attempt));
    return Math.random() * raw;
}
function serializeParams1(params: Record<string, unknown>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value == null) continue;
        if (Array.isArray(value)) {
            value.forEach((v) => search.append(`${key}[]`, String(v)));
        } else if (typeof value === 'object') {
            search.append(key, JSON.stringify(value));
        } else {
            search.append(key, String(value));
        }
    }
    return search.toString();
} */
/**    async request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>> {
        let merged: RequestConfig = { ...this.defaults, ...config };
        merged = await this.interceptors.request.run(merged);

        const key = this.dedupeKey(merged);
        const shouldDedupe = (merged.dedupe ?? true) && (merged.method ?? 'GET').toUpperCase() === 'GET';

        if (shouldDedupe && this.inFlight.has(key)) {
            return this.inFlight.get(key)! as Promise<HttpResponse<T>>;
        }

        const promise = this.execute<T>(merged).finally(() => {
            if (shouldDedupe) this.inFlight.delete(key);
        });

        if (shouldDedupe) this.inFlight.set(key, promise as Promise<HttpResponse>);

        try {
            return await promise;
        } catch (err) {
            return this.interceptors.response.runError(err);
        }
    } */
/**    private async execute<T>(config: RequestConfig, attempt = 0): Promise<HttpResponse<T>> {
     const url = this.buildUrl(config);
     const controller = new AbortController();

     if (config.tag) {
         if (!this.groupControllers.has(config.tag)) this.groupControllers.set(config.tag, new Set());
         this.groupControllers.get(config.tag)!.add(controller);
     }

     const timeoutId = config.timeout
         ? setTimeout(() => controller.abort(), config.timeout)
         : null;

     const headers = new Headers(config.headers);

     if (config.revalidate) {
         const cached = this.etagCache.get(url);
         if (cached) headers.set('If-None-Match', cached.etag);
     }

     try {
         const res = await fetch(url, { ...config, headers, signal: controller.signal });

         if (timeoutId) clearTimeout(timeoutId);
         if (config.tag) this.groupControllers.get(config.tag)?.delete(controller);

         if (res.status === 304 && config.revalidate) {
             const cached = this.etagCache.get(url)!;
             return this.buildResponse<T>(cached.body as T, res, config);
         }

         if (!res.ok) {
             const retryCfg = this.resolveRetry(config);
             if (retryCfg && attempt < (retryCfg.attempts ?? 3) && (retryCfg.retryOn ?? [408, 429, 500, 502, 503, 504]).includes(res.status)) {
                 await this.wait(axioscomputeBackoff(attempt, retryCfg as any));
                 return this.execute<T>(config, attempt + 1);
             }
             throw new HttpError(`Request failed with status ${res.status}`, res.status, config, res);
         }

         const data = await this.parseBody<T>(res, config, url);
         return this.buildResponse<T>(data, res, config);
     } catch (err) {
         if (timeoutId) clearTimeout(timeoutId);
         if (config.tag) this.groupControllers.get(config.tag)?.delete(controller);

         const isAbort = err instanceof Error && err.name === 'AbortError';
         if (isAbort && !controller.signal.aborted) throw err; // group-cancel vs timeout distinguished by caller if needed

         const retryCfg = this.resolveRetry(config);
         const isNetworkOrTimeout = isAbort || (err instanceof TypeError);
         if (retryCfg && isNetworkOrTimeout && attempt < (retryCfg.attempts ?? 3)) {
             await this.wait(axioscomputeBackoff(attempt, retryCfg as any));
             return this.execute<T>(config, attempt + 1);
         }

         if (err instanceof HttpError) throw err;
         throw new HttpError(isAbort ? 'Request timed out' : String(err), null, config);
     }
 } */
export interface RequestConfig extends Omit<RequestInit, 'headers'> {
    url?: string;
    baseURL?: string;
    method?: string;
    headers?: HeadersInit;
    params?: Record<string, unknown>;
    timeout?: number;
    retry?: axiosRetryConfig | false;
    dedupe?: boolean;
    tag?: string;
    revalidate?: boolean;
    _retryAttempt?: number;
    cache?: 'force-cache' | 'no-cache' | 'default';
    cacheTTL?: number;
    circuit_breaker?: {
        failureThreshold: number;
        timeout: number;
    };
    retry_strategy?: 'exponential-backoff' | 'linear' | "fixed";
    retry_delay?: number;
    signal?: AbortSignal;
    circuit_breaker_key?: string;
    validate_response?: (data: any) => boolean;
    validate?: (data: unknown) => boolean;
    onDownloadProgress?: (loaded: number, total: number | null) => void;
    interceptors_request?: (config: RequestConfig) => RequestConfig | Promise<RequestConfig>;
    interceptors_response?: (error: any) => any | Promise<any>;
    transform_request?: (data: any) => any;
    transform_response?: (data: any) => any;
    validate_status?: (status: number) => boolean;
    on_progress?: (progress: {
        loaded: number;
        total: number | null;
        percentage: number;
    }) => void;
}
export declare class HTTP_CLIENT {
    defaults: RequestConfig;
    interceptors: {
        request: InterceptorManager<RequestConfig>;
        response: InterceptorManager<HttpResponse<unknown>>;
    };
    private inFlight;
    private etagCache;
    private ttlCache;
    private groupControllers;
    private circuitBreakers;
    private refreshInFlight;
    constructor(config?: RequestConfig);
    create(config?: RequestConfig): HTTP_CLIENT;
    get<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    post<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<HttpResponse<T>>;
    put<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<HttpResponse<T>>;
    patch<T = unknown>(url: string, body?: unknown, config?: RequestConfig): Promise<HttpResponse<T>>;
    delete<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    head<T = unknown>(url: string, config?: RequestConfig): Promise<HttpResponse<T>>;
    cancelGroup(tag: string): void;
    private getCircuitBreaker;
    request<T = unknown>(config: RequestConfig): Promise<HttpResponse<T>>;
    private serializeBody;
    private dedupeKey;
    private buildUrl;
    private execute;
    private computeDelay;
    private resolveRetry;
    private wait;
    private parseBody;
    private buildResponse;
}
export {};
/**


 */
