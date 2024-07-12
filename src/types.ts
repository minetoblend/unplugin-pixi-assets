import type { AssetPlugin, AssetPluginId } from './core/plugins'
import type { TexturePluginOptions } from './core/plugins/texturePlugin'

export interface Options extends TexturePluginOptions {
  plugins?: (AssetPlugin | AssetPluginId)[]
}
