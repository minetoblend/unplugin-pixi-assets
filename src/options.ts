import type { AssetPluginId } from './core/plugins'
import type { AssetPlugin } from './core/plugins/assetPlugin'
import { texturePlugin } from './core/plugins/texturePlugin'
import type { Options } from './types'

export interface ResolvedOptions {
  plugins: AssetPlugin[]
}

function resolvePlugin(plugin: AssetPlugin | AssetPluginId, options: Options): AssetPlugin {
  if (typeof plugin === 'string') {
    switch (plugin) {
      case 'textures':
        return texturePlugin(options)
      default:
        throw new Error(`Unknown asset plugin: ${plugin}`)
    }
  }
  return plugin
}

const defaultPlugins: AssetPluginId[] = ['textures']

export function resolveOptions(options: Options): ResolvedOptions {
  return {
    plugins: (options.plugins || defaultPlugins).map(plugin => resolvePlugin(plugin, options)),
  }
}
