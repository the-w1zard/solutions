import { CIRCUITBREAKER } from '../crdts/circuit_breaker';
// #region ███████████████ HTTP CLIENT █ Axios replacement with 0 dependencies █████
/** SHIITY USAGE
 * const api = new HttpClient({// WE NEED A WRAPPER FOR THIS
 *   baseURL: 'http://localhost:3000/',
 *   timeout: 10_000,
 *   retry: { attempts: 3, retryOn: [429, 502, 503, 504] },
 * });
 *
 * api.interceptors.request.use((config) => {
 *   config.headers.set('Authorization', `Bearer ${getToken()}`);
 *   return config;
 * });
 *
 * api.interceptors.response.use(
 *   (res) => res,
 *   async (err) => {
 *     if (err.status === 401) {
 *       await refreshToken();       // single-flighted automatically
 *       return api.request(err.config);
 *     }
 *
 *     throw err;
 *   },
 * );
 *
 * const { data } = await api.get('/users', { params: { active: true } });
 *
 * // cancel everything tagged 'dashboard' when the user navigates away
 * api.get('/stats', { tag: 'dashboard' });
 * api.cancelGroup('dashboard');
 */
class HttpError extends Error {
    status;
    config;
    response;
    constructor(message, status, config, response) {
        super(message);
        this.status = status;
        this.config = config;
        this.response = response;
        this.name = 'HttpError';
    }
}
class InterceptorManager {
    handlers = [];
    use(fulfilled, rejected) {
        this.handlers.push({ fulfilled, rejected });
        return this.handlers.length - 1;
    }
    eject(id) { this.handlers[id] = null; }
    async run(value) {
        let result = value;
        for (const h of this.handlers) {
            if (!h)
                continue;
            result = await h.fulfilled(result);
        }
        return result;
    }
    async runError(error) {
        let current = error;
        for (const h of this.handlers) {
            if (!h?.rejected)
                continue;
            try {
                return await h.rejected(current); // a handler can recover and return a value
            }
            catch (e) {
                current = e;
            }
        }
        throw current;
    }
}
/**const http_req = await RuneHTTP_lvl2({
    name: 'custom label that all other platform primitives have',// optional
    // global function setters can also set retry timeout on success and on error in each request
    sequential: true,// optional
    concurrent: false,// optional
    retry: 50,// optional
    timeout: 1000,// optional
    cache: 'force-cache',// optional
    cacheTTL: 60000,// optional
    retry_delay: 1000,
    retry_strategy: 'exponential-backoff',
    circuit_breaker: {
        failureThreshold: 5,
        timeout: 60000,
    },
    on_progress: (progress) => {
        console.log(`${progress.percentage}%`);
    },
    signal: controller.signal,
    transform_request: (data) => JSON.stringify(data),
    transform_response: (data) => JSON.parse(data),
    validate_status: (status) => status < 300,
    validate_response: (data) => data.success === true,
    interceptors_request: ((config: any) => {// optional
        config.headers.set('Authorization', `Bearer ${getToken()}`);
        return config;
    }),
    interceptors_response: (async (res: any) => {// optional
        if (res) {
            await refreshToken();       // single-flighted automatically
            return api.request(res.config);
        }
    }),
    on_success: () => { console.log('[Batch SUCCESS]') },// optional
    on_error: () => { console.log('[Batch][ERROR]') },// optional
}, ({ self }: any) => ({
    http_req_1: {// user defined labels
        url: 'https://microsoft.com',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { id: "1", method: "GET", url: "/me" },
    },
    http_req_2: {
        url: 'https://microsoft.com',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { id: "1", method: "GET", url: "/me" },
        on_success: () => { console.log('[Batch SUCCESS]') },
        on_error: () => { console.log('[Batch][ERROR]') },
    },
    http_req_3: {
        url: 'https://microsoft.com',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { id: "1", method: "GET", url: "/me" },
        retry: 50,// optional
        timeout: 1000,// optional
        cache: 'force-cache',// optional
        cacheTTL: 60000,// optional
        retry_delay: 1000,
        retry_strategy: 'exponential-backoff',
        circuit_breaker: {
            failureThreshold: 5,
            timeout: 60000,
        },
        signal: controller.signal,
        on_progress: (progress) => {
            console.log(`${progress.percentage}%`);
        },
        transform_request: (data) => JSON.stringify(data),
        transform_response: (data) => JSON.parse(data),
        validate_status: (status) => status < 300,
        validate_response: (data) => data.success === true,
        interceptors_request: ((config: any) => {// optional
            config.headers.set(`Authorization', 'Bearer ${getToken()}`);
            return config;
        }),
        interceptors_response: (async (res: any) => {// optional
            if (res) {
                await refreshToken();       // single-flighted automatically
                return api.request(res.config);
            }
        }),
        on_success: () => { console.log('[Batch SUCCESS]') },// optional
        on_error: () => { console.log('[Batch][ERROR]') },// optional
    },
}))
 */
function axioscomputeBackoff(attempt, opts) { const raw = Math.min(opts.max, opts.base * Math.pow(opts.factor, attempt)); return Math.random() * raw; }
function linearBackoff(attempt, delay) { return delay * (attempt + 1); }
function fixedBackoff(delay) { return delay; }
function serializeParams(params) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value == null)
            continue;
        if (Array.isArray(value)) {
            value.forEach((v) => search.append(`${key}[]`, String(v)));
        }
        else if (typeof value === 'object') {
            search.append(key, JSON.stringify(value));
        }
        else {
            search.append(key, String(value));
        }
    }
    return search.toString();
}
export class HTTP_CLIENT {
    defaults;
    interceptors = {
        request: new InterceptorManager(),
        response: new InterceptorManager(),
    };
    inFlight = new Map();
    etagCache = new Map();
    ttlCache = new Map();
    groupControllers = new Map();
    circuitBreakers = new Map();
    refreshInFlight = null;
    constructor(config = {}) { this.defaults = { method: 'GET', baseURL: 'http://localhost:3000/', timeout: 10_000, dedupe: true, ...config }; }
    create(config = {}) { return new HTTP_CLIENT({ ...this.defaults, ...config }); }
    get(url, config = {}) { return this.request({ ...config, url, method: 'GET' }); }
    post(url, body, config = {}) { return this.request({ ...config, url, method: 'POST', body: this.serializeBody(body, config) }); }
    put(url, body, config = {}) { return this.request({ ...config, url, method: 'PUT', body: this.serializeBody(body, config) }); }
    patch(url, body, config = {}) { return this.request({ ...config, url, method: 'PATCH', body: this.serializeBody(body, config) }); }
    delete(url, config = {}) { return this.request({ ...config, url, method: 'DELETE' }); }
    head(url, config = {}) { return this.request({ ...config, url, method: 'HEAD' }); }
    cancelGroup(tag) { this.groupControllers.get(tag)?.forEach((c) => c.abort()); this.groupControllers.delete(tag); }
    getCircuitBreaker(config) {
        if (!config.circuit_breaker)
            return null;
        const key = config.circuit_breaker_key ?? this.buildUrl(config);
        if (!this.circuitBreakers.has(key)) {
            this.circuitBreakers.set(key, new CIRCUITBREAKER(key, {
                failureThreshold: config.circuit_breaker.failureThreshold ?? 5,
                cooldownMs: config.circuit_breaker.timeout ?? 60000,
                cooldownMaxMs: (config.circuit_breaker.timeout ?? 60000) * 10,
                cooldownFactor: 2,
                halfOpenMaxAttempts: 1,
                timeoutMs: Number(config.timeout),
                isFailure: () => true,
            }, () => { }, undefined));
        }
        return this.circuitBreakers.get(key);
    }
    async request(config) {
        let merged = { ...this.defaults, ...config };
        merged = await this.interceptors.request.run(merged);
        if (merged.interceptors_request)
            merged = (await merged.interceptors_request(merged)) ?? merged;
        const url = this.buildUrl(merged);
        const key = this.dedupeKey(merged);
        const shouldDedupe = (merged.dedupe ?? true) && (merged.method ?? 'GET').toUpperCase() === 'GET';
        if (merged.cache === 'force-cache' && merged.cacheTTL) {
            const cached = this.ttlCache.get(key);
            if (cached && cached.expiresAt > Date.now()) {
                return this.buildResponse(cached.body, new Response(null, { status: 200 }), merged);
            }
        }
        if (shouldDedupe && this.inFlight.has(key)) {
            return this.inFlight.get(key);
        }
        const breaker = this.getCircuitBreaker(merged);
        const runner = async () => { if (breaker) {
            return breaker.execute(() => this.execute(merged));
        } return this.execute(merged); };
        const promise = runner().finally(() => { if (shouldDedupe)
            this.inFlight.delete(key); });
        if (shouldDedupe)
            this.inFlight.set(key, promise);
        try {
            const res = await promise;
            if (merged.cache === 'force-cache' && merged.cacheTTL) {
                this.ttlCache.set(key, { body: res.data, expiresAt: Date.now() + merged.cacheTTL });
            }
            return res;
        }
        catch (err) {
            if (merged.interceptors_response) {
                const recovered = await merged.interceptors_response(err).catch(() => { throw err; });
                if (recovered)
                    return recovered;
            }
            return this.interceptors.response.runError(err);
        }
    }
    serializeBody(body, config) {
        if (body == null)
            return undefined;
        if (config.transform_request) {
            const transformed = config.transform_request(body);
            if (typeof transformed === 'string')
                return transformed;
            (config.headers ??= {});
            const headers = new Headers(config.headers);
            if (!headers.has('Content-Type'))
                headers.set('Content-Type', 'application/json');
            config.headers = headers;
            return JSON.stringify(transformed);
        }
        if (body instanceof FormData || body instanceof Blob || typeof body === 'string') {
            return body;
        }
        (config.headers ??= {});
        const headers = new Headers(config.headers);
        if (!headers.has('Content-Type'))
            headers.set('Content-Type', 'application/json');
        config.headers = headers;
        return JSON.stringify(body);
    }
    dedupeKey(config) { return `${config.method}:${this.buildUrl(config)}`; }
    buildUrl(config) {
        const base = config.baseURL ?? '';
        const url = /^https?:\/\//.test(config.url ?? '') ? config.url : base.replace(/\/$/, '') + '/' + (config.url ?? '').replace(/^\//, '');
        if (!config.params)
            return url;
        const qs = serializeParams(config.params);
        return qs ? `${url}${url.includes('?') ? '&' : '?'}${qs}` : url;
    }
    async execute(config, attempt = 0) {
        const url = this.buildUrl(config);
        const controller = new AbortController();
        // merge caller-supplied signal — abort propagates either way, from timeout OR the caller's own signal
        if (config.signal) {
            if (config.signal.aborted)
                controller.abort();
            else
                config.signal.addEventListener('abort', () => controller.abort(), { once: true });
        }
        if (config.tag) {
            if (!this.groupControllers.has(config.tag))
                this.groupControllers.set(config.tag, new Set());
            this.groupControllers.get(config.tag).add(controller);
        }
        const timeoutId = config.timeout ? setTimeout(() => controller.abort(), config.timeout) : null;
        const headers = new Headers(config.headers);
        if (config.revalidate) {
            const cached = this.etagCache.get(url);
            if (cached)
                headers.set('If-None-Match', cached.etag);
        }
        try {
            const res = await fetch(url, { ...config, headers, signal: controller.signal });
            if (timeoutId)
                clearTimeout(timeoutId);
            if (config.tag)
                this.groupControllers.get(config.tag)?.delete(controller);
            if (res.status === 304 && config.revalidate) {
                const cached = this.etagCache.get(url);
                return this.buildResponse(cached.body, res, config);
            }
            const statusOk = config.validate_status ? config.validate_status(res.status) : res.ok;
            if (!statusOk) {
                const retryCfg = this.resolveRetry(config);
                if (retryCfg && attempt < (retryCfg.attempts ?? 3) && (retryCfg.retryOn ?? [408, 429, 500, 502, 503, 504]).includes(res.status)) {
                    await this.wait(this.computeDelay(attempt, config, retryCfg));
                    return this.execute(config, attempt + 1);
                }
                throw new HttpError(`Request failed with status ${res.status}`, res.status, config, res);
            }
            const data = await this.parseBody(res, config, url);
            if (config.validate_response && !config.validate_response(data)) {
                throw new HttpError('Response failed custom validation', res.status, config, res);
            }
            return this.buildResponse(data, res, config);
        }
        catch (err) {
            if (timeoutId)
                clearTimeout(timeoutId);
            if (config.tag)
                this.groupControllers.get(config.tag)?.delete(controller);
            const isAbort = err instanceof Error && err.name === 'AbortError';
            if (isAbort && config.signal?.aborted)
                throw err; // caller explicitly cancelled — never retry that
            const retryCfg = this.resolveRetry(config);
            const isNetworkOrTimeout = isAbort || (err instanceof TypeError);
            if (retryCfg && isNetworkOrTimeout && attempt < (retryCfg.attempts ?? 3)) {
                await this.wait(this.computeDelay(attempt, config, retryCfg));
                return this.execute(config, attempt + 1);
            }
            if (err instanceof HttpError)
                throw err;
            throw new HttpError(isAbort ? 'Request timed out' : String(err), null, config);
        }
    }
    computeDelay(attempt, config, retryCfg) {
        switch (config.retry_strategy) {
            case 'linear': return linearBackoff(attempt, config.retry_delay ?? 300);
            case 'fixed': return fixedBackoff(config.retry_delay ?? 300);
            case 'exponential-backoff':
            default:
                return axioscomputeBackoff(attempt, retryCfg);
        }
    }
    resolveRetry(config) {
        if (config.retry === false)
            return null;
        const r = typeof config.retry === 'number' ? { attempts: config.retry } : (config.retry ?? {});
        return { attempts: r.attempts ?? 3, retryOn: r.retryOn, base: r.base ?? 300, factor: r.factor ?? 2, max: r.max ?? 8000 };
    }
    wait(ms) { return new Promise((resolve) => setTimeout(resolve, ms)); }
    async parseBody(res, config, url) {
        const contentType = res.headers.get('content-type') ?? '';
        let data;
        if (config.onDownloadProgress || config.on_progress) {
            if (res.body) {
                const total = Number(res.headers.get('content-length')) || null;
                let loaded = 0;
                const reader = res.body.getReader();
                const chunks = [];
                while (true) {
                    const { done, value } = await reader.read();
                    if (done)
                        break;
                    chunks.push(value);
                    loaded += value.length;
                    config.onDownloadProgress?.(loaded, total);
                    if (config.on_progress) {
                        const percentage = total ? Math.round((loaded / total) * 100) : 0;
                        config.on_progress({ percentage, loaded, total });
                    }
                }
                const text = new TextDecoder().decode(chunks.reduce((acc, c) => new Uint8Array([...acc, ...c]), new Uint8Array()));
                data = contentType.includes('application/json') ? JSON.parse(text || 'null') : text;
            }
            else {
                data = contentType.includes('application/json') ? await res.json().catch(() => null) : await res.text();
            }
        }
        else if (contentType.includes('application/json')) {
            data = await res.json().catch(() => null);
        }
        else {
            data = await res.text();
        }
        if (config.transform_response)
            data = config.transform_response(data);
        if (config.validate && !config.validate(data)) {
            throw new HttpError('Response failed validation', res.status, config, res);
        }
        const etag = res.headers.get('etag');
        if (etag && config.revalidate)
            this.etagCache.set(url, { etag, body: data });
        return data;
    }
    buildResponse(data, res, config) { return { data, status: res.status, headers: res.headers, config, raw: res }; }
}
/**


 */
// #endregion
