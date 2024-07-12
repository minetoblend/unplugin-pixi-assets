import type { AssetPlugin, AssetPluginId } from './core/plugins'
import type { TexturePluginOptions } from './core/plugins/texturePlugin'

export interface Options {
  plugins?: (AssetPlugin | AssetPluginId)[]
  textures?: TexturePluginOptions
}
