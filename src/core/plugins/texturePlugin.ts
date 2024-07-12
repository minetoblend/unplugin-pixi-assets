import type { TextureOptions, TextureSourceOptions } from 'pixi.js'
import type { AssetPlugin } from './assetPlugin'

export interface TexturePluginOptions {
  defaultTextureOptions?: TextureSourceOptions
}

export function texturePlugin(options: TexturePluginOptions): AssetPlugin {
  const defaultTextureOptions = options.defaultTextureOptions || {}

  return {
    name: 'textures',
    load(path, query) {
      if (query.texture === undefined)
        return null

      const textureOptions = {
        ...defaultTextureOptions,
      } as TextureSourceOptions

      let alias: string | undefined

      for (const key in query as Record<keyof TextureOptions, string>) {
        switch (key) {
          case alias:
            alias = query[key]
            break

          case 'alphaMode':
          case 'label':
          case 'scaleMode':
          case 'magFilter':
          case 'minFilter':
          case 'mipmapFilter':
          case 'addressMode':
          case 'addressModeU':
          case 'addressModeV':
          case 'addressModeW':
            textureOptions[key] = query[key] as any
            break

          case 'autoGenerateMipmaps':
          case 'autoGarbageCollect':
            textureOptions[key] = query[key] !== 'false'
            break

          case 'mipLevelCount':
          case 'maxAnisotropy':
          case 'lodMinClamp':
          case 'lodMaxClamp':
          {
            const parsed = Number.parseFloat(query[key])
            if (!Number.isNaN(parsed))
              textureOptions[key] = parsed
            else console.warn(`Invalid value for ${key}: ${query[key]}`)
            break
          }
        }
      }

      const assetOptions: string[] = []
      if (alias)
        assetOptions.push(`alias: ${JSON.stringify(alias)}`)
      if (Object.keys(textureOptions).length > 0)
        assetOptions.push(`data: ${JSON.stringify(textureOptions)}`)

      return `
import { Assets } from "pixi.js";
import textureUrl from ${JSON.stringify(path)};
export default await Assets.load({
  src: textureUrl,
  loadParser: 'loadTextures',${
    assetOptions.map(it => `  ${it}`).join(',\n')}
})`
    },
  }
}
