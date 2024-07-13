import type { UnpluginFactory } from 'unplugin'
import { createUnplugin } from 'unplugin'
import type { Options } from './types'
import { resolveOptions } from './options'
import { createContext } from './core/context'
import { ASSETS_MODULE, MACRO_LOAD_ASSSET_QUERY, MACRO_USE_ASSSET_QUERY, asVirtualId, getVirtualId } from './core/moduleConstants'

export const unpluginFactory: UnpluginFactory<Options | undefined> = (opt = {}) => {
  const options = resolveOptions(opt)
  const ctx = createContext(options)

  return {
    name: 'unplugin-pixi-assets',
    enforce: 'post',

    buildStart() {
      ctx.scanAssets(options.watch)
    },

    buildEnd() {
      ctx.stopWatcher()
    },

    transform(code, id) {
      return ctx.useAssetTransform(code, id)
    },

    resolveId(id) {
      if (id.startsWith(ASSETS_MODULE))
        return asVirtualId(id)

      return null
    },

    load(id) {
      const resolvedId = getVirtualId(id)

      if (!resolvedId)
        return null

      if (MACRO_USE_ASSSET_QUERY.test(resolvedId))
        return ctx.generateUseAsset(resolvedId)

      if (MACRO_LOAD_ASSSET_QUERY.test(resolvedId))
        return ctx.generateLoadAsset(resolvedId)

      return null
    },
  }
}

export const pixiAssets = createUnplugin(unpluginFactory)

export default pixiAssets
