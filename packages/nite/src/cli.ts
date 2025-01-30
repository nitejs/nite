import path from 'node:path'
import fs from 'node:fs'
import { cac } from 'cac'
import colors from 'picocolors'
import { VERSION } from './constants'
import type { LogLevel } from './logger'

const cli = cac('nite')

// global options
interface GlobalCLIOptions {
  '--'?: string[]
  c?: boolean | string
  config?: string
  base?: string
  l?: LogLevel
  logLevel?: LogLevel
  clearScreen?: boolean
  configLoader?: 'bundle' | 'runner'
  d?: boolean | string
  debug?: boolean | string
  f?: string
  filter?: string
  m?: string
  mode?: string
  force?: boolean
  w?: boolean
}

interface BuilderCLIOptions {
  app?: boolean
}

let profileSession = global.__nite_profile_session
let profileCount = 0

export const stopProfiler = (
  log: (message: string) => void,
): void | Promise<void> => {
  if (!profileSession) return
  return new Promise((res, rej) => {
    profileSession!.post('Profiler.stop', (err: any, { profile }: any) => {
      // Write profile to disk, upload, etc.
      if (!err) {
        const outPath = path.resolve(
          `./nite-profile-${profileCount++}.cpuprofile`,
        )
        fs.writeFileSync(outPath, JSON.stringify(profile))
        log(
          colors.yellow(
            `CPU profile written to ${colors.white(colors.dim(outPath))}`,
          ),
        )
        profileSession = undefined
        res()
      } else {
        rej(err)
      }
    })
  })
}

const filterDuplicateOptions = <T extends object>(options: T) => {
  for (const [key, value] of Object.entries(options)) {
    if (Array.isArray(value)) {
      options[key as keyof T] = value[value.length - 1]
    }
  }
}
/**
 * removing global flags before passing as command specific sub-configs
 */
// function cleanGlobalCLIOptions<Options extends GlobalCLIOptions>(
//   options: Options,
// ): Omit<Options, keyof GlobalCLIOptions> {
//   const ret = { ...options }
//   delete ret['--']
//   delete ret.c
//   delete ret.config
//   delete ret.base
//   delete ret.l
//   delete ret.logLevel
//   delete ret.clearScreen
//   delete ret.configLoader
//   delete ret.d
//   delete ret.debug
//   delete ret.f
//   delete ret.filter
//   delete ret.m
//   delete ret.mode
//   delete ret.w

//   // convert the sourcemap option to a boolean if necessary
//   if ('sourcemap' in ret) {
//     const sourcemap = ret.sourcemap as `${boolean}` | 'inline' | 'hidden'
//     ret.sourcemap =
//       sourcemap === 'true'
//         ? true
//         : sourcemap === 'false'
//           ? false
//           : ret.sourcemap
//   }
//   if ('watch' in ret) {
//     const watch = ret.watch
//     ret.watch = watch ? {} : undefined
//   }

//   return ret
// }

/**
 * removing builder flags before passing as command specific sub-configs
 */
// function cleanBuilderCLIOptions<Options extends BuilderCLIOptions>(
//   options: Options,
// ): Omit<Options, keyof BuilderCLIOptions> {
//   const ret = { ...options }
//   delete ret.app
//   return ret
// }

/**
 * host may be a number (like 0), should convert to string
 */
const convertHost = (v: any) => {
  if (typeof v === 'number') {
    return String(v)
  }
  return v
}

/**
 * base may be a number (like 0), should convert to empty string
 */
const convertBase = (v: any) => {
  if (v === 0) {
    return ''
  }
  return v
}

cli
  .option('-c, --config <file>', `[string] use specified config file`)
  .option('--base <path>', `[string] public base path (default: /)`, {
    type: [convertBase],
  })
  .option('-l, --logLevel <level>', `[string] info | warn | error | silent`)
  .option('--clearScreen', `[boolean] allow/disable clear screen when logging`)
  .option(
    '--configLoader <loader>',
    `[string] use 'bundle' to bundle the config with esbuild or 'runner' (experimental) to process it on the fly (default: bundle)`,
  )
  .option('-d, --debug [feat]', `[string | boolean] show debug logs`)
  .option('-f, --filter <filter>', `[string] filter debug logs`)
  .option('-m, --mode <mode>', `[string] set env mode`)

// dev
cli
  .command('[root]', 'start dev server') // default command
  .alias('serve') // the command is called 'serve' in nite's API
  .alias('dev') // alias to align with the script name
  .option('--host [host]', `[string] specify hostname`, { type: [convertHost] })
  .option('--port <port>', `[number] specify port`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .option('--cors', `[boolean] enable CORS`)
  .option('--strictPort', `[boolean] exit if specified port is already in use`)
  .option(
    '--force',
    `[boolean] force the optimizer to ignore the cache and re-bundle`,
  )
  .action(async (root: string, options: any & GlobalCLIOptions) => {
    filterDuplicateOptions(options)
    // output structure is preserved even after bundling so require()
    // is ok here
    console.log('root', root)
  })

// build
cli
  .command('build [root]', 'build for production')
  .option('--target <target>', `[string] transpile target (default: 'modules')`)
  .option('--outDir <dir>', `[string] output directory (default: dist)`)
  .option(
    '--assetsDir <dir>',
    `[string] directory under outDir to place assets in (default: assets)`,
  )
  .option(
    '--assetsInlineLimit <number>',
    `[number] static asset base64 inline threshold in bytes (default: 4096)`,
  )
  .option(
    '--ssr [entry]',
    `[string] build specified entry for server-side rendering`,
  )
  .option(
    '--sourcemap [output]',
    `[boolean | "inline" | "hidden"] output source maps for build (default: false)`,
  )
  .option(
    '--minify [minifier]',
    `[boolean | "terser" | "esbuild"] enable/disable minification, ` +
      `or specify minifier to use (default: esbuild)`,
  )
  .option('--manifest [name]', `[boolean | string] emit build manifest json`)
  .option('--ssrManifest [name]', `[boolean | string] emit ssr manifest json`)
  .option(
    '--emptyOutDir',
    `[boolean] force empty outDir when it's outside of root`,
  )
  .option('-w, --watch', `[boolean] rebuilds when modules have changed on disk`)
  .option('--app', `[boolean] same as \`builder: {}\``)
  .action(
    async (
      root: string,
      options: BuilderCLIOptions & GlobalCLIOptions,
    ) => {
      filterDuplicateOptions(options)
      console.log('root', root)
    },
  )

// optimize
cli
  .command('optimize [root]', 'pre-bundle dependencies')
  .option(
    '--force',
    `[boolean] force the optimizer to ignore the cache and re-bundle`,
  )
  .action(
    async (root: string, options: { force?: boolean } & GlobalCLIOptions) => {
      filterDuplicateOptions(options)
      console.log('root', root)
    },
  )

// preview
cli
  .command('preview [root]', 'locally preview production build')
  .option('--host [host]', `[string] specify hostname`, { type: [convertHost] })
  .option('--port <port>', `[number] specify port`)
  .option('--strictPort', `[boolean] exit if specified port is already in use`)
  .option('--open [path]', `[boolean | string] open browser on startup`)
  .option('--outDir <dir>', `[string] output directory (default: dist)`)
  .action(
    async (
      root: string,
      options: {
        host?: string | boolean
        port?: number
        open?: boolean | string
        strictPort?: boolean
        outDir?: string
      } & GlobalCLIOptions,
    ) => {
      filterDuplicateOptions(options)
      console.log('root', root)
    },
  )

cli.help()
cli.version(VERSION)

cli.parse()
