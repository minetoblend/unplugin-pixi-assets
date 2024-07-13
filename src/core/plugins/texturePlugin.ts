import type { TextureSourceOptions } from 'pixi.js'
import { generateAssetLoader } from '../../codegen/generateAssetLoader'
import type { AssetPlugin } from './assetPlugin'

export interface TexturePluginOptions {
  defaultOptions?: TextureSourceOptions
}

export function texturePlugin(options: TexturePluginOptions = {}): AssetPlugin {
  const {
    defaultOptions = {},
  } = options

  const regex = /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i

  return {
    name: 'textures',
    test(path) {
      return regex.test(path)
    },
    generateAssetLoader(path) {
      return generateAssetLoader({
        path,
        loadParser: 'loadTextures',
        defaultOptions,
      })
    },
    getAssetInfo() {
      return {
        assetType: 'import("pixi.js").Texture',
        loaderOptionsType: ' import("pixi.js").TextureSourceOptions',
      }
    },
  }
}
