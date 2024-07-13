import type { AssetPlugin } from './assetPlugin'

export function soundPlugin(): AssetPlugin {
  const regex = /\.(mp3|wav|ogg)$/i

  return {
    name: 'sounds',
    test(path) {
      return regex.test(path)
    },
    generateAssetLoader(path) {
      return `
import { Sound } from '@pixi/sound'

let promise = null

const loader = (options = {}) => {
  if (!promise) {
    promise = new Promise((resolve, reject) => {
      Sound.from({
        url: ${JSON.stringify(path)},
        preload: true,
        ...options,
        loaded(err, sound, instance) {
          if (err) {
            reject(err)
          } else {
            resolve(sound)
          }    
        }
      })
    })
  }

  return promise
}

export default loader
`.trimStart()
    },
    getAssetInfo() {
      return {
        assetType: 'import("@pixi/sound").Sound',
        loaderOptionsType: 'import("@pixi/sound").Options',
      }
    },
  }
}
