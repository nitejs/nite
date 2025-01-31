// import type * as Rollup from 'rollup'
// export type { Rollup }
// export { parseAst, parseAstAsync } from 'rollup/parseAst'
// export type { TransformOptions as EsbuildTransformOptions } from 'esbuild'
// export type { ServerOptions } from 'node:https'
interface UserConfig {}
export type { UserConfig }

function defineConfig(config: UserConfig) {
  return config
}
export { defineConfig }
