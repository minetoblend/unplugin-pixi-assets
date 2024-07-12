import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import { parseId } from './core/moduleConstants'
import type { Options } from './types'
import { resolveOptions } from './options'
import { createContext } from './core/ctx'

export const unpluginFactory: UnpluginFactory<Options | undefined> = (opt = {}) => {
  const options = resolveOptions(opt)
  const ctx = createContext(options)

  return {
    name: 'unplugin-pixi-assets',
    enforce: 'pre',

    load(id) {
      const { path, query } = parseId(id)

      return ctx.load(path, query)
    },
  }
}

export const pixiAssets = createUnplugin(unpluginFactory)

export default pixiAssets
