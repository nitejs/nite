export interface HmrOptions { }
export interface WatchOptions { }
export interface FileSystemServeOptions { }
export interface DevEnvironment { }

export interface RunnerOptions {
    /**
     * Configure HMR-specific options (port, host, path & protocol)
     */
    hmr?: HmrOptions | boolean
    /**
     * Do not start the websocket connection.
     * @experimental
     */
    ws?: false
    /**
     * Warm-up files to transform and cache the results in advance. This improves the
     * initial page load during server starts and prevents transform waterfalls.
     */
    warmup?: {
        /**
         * The files to be transformed and used on the client-side. Supports glob patterns.
         */
        clientFiles?: string[]
        /**
         * The files to be transformed and used in SSR. Supports glob patterns.
         */
        ssrFiles?: string[]
    }
    /**
     * chokidar watch options or null to disable FS watching
     * https://github.com/paulmillr/chokidar/tree/3.6.0#api
     */
    watch?: WatchOptions | null
    /**
     * Create Vite dev server to be used as a middleware in an existing server
     * @default false
     */
    // middlewareMode?:
    //   | boolean
    //   | {
    //       /**
    //        * Parent server instance to attach to
    //        *
    //        * This is needed to proxy WebSocket connections to the parent server.
    //        */
    //       server: HttpServer
    //     }
    /**
     * Options for files served via '/\@fs/'.
     */
    fs?: FileSystemServeOptions
    /**
     * Origin for the generated asset URLs.
     *
     * @example `http://127.0.0.1:8080`
     */
    origin?: string
    /**
     * Pre-transform known direct imports
     * @default true
     */
    preTransformRequests?: boolean
    /**
     * Whether or not to ignore-list source files in the dev server sourcemap, used to populate
     * the [`x_google_ignoreList` source map extension](https://developer.chrome.com/blog/devtools-better-angular-debugging/#the-x_google_ignorelist-source-map-extension).
     *
     * By default, it excludes all paths containing `node_modules`. You can pass `false` to
     * disable this behavior, or, for full control, a function that takes the source path and
     * sourcemap path and returns whether to ignore the source path.
     */
    sourcemapIgnoreList?:
    | false
    | ((sourcePath: string, sourcemapPath: string) => boolean)
    /**
     * Backward compatibility. The buildStart and buildEnd hooks were called only once for all
     * environments. This option enables per-environment buildStart and buildEnd hooks.
     * @default false
     * @experimental
     */
    perEnvironmentStartEndDuringDev?: boolean
    /**
     * Run HMR tasks, by default the HMR propagation is done in parallel for all environments
     * @experimental
     */
    hotUpdateEnvironments?: (
        hmr: (environment: DevEnvironment) => Promise<void>,
    ) => Promise<void>
}

export interface InlineConfig { }
export interface ViteDevServer { }
function _createServer(
    inlineConfig: InlineConfig = {},
    RunnerOptions: RunnerOptions = {},
): Promise<ViteDevServer> {
    return Promise.resolve({} as ViteDevServer)
}
export function createServer(
    inlineConfig: InlineConfig = {},
): Promise<ViteDevServer> {
    return _createServer(inlineConfig)
}