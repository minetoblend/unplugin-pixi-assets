declare module 'unplugin-pixi-assets/runtime' {
  import type { AssetNamedMap } from 'virtual:pixi-assets'

  export interface TypesConfig {
    AssetNamedMap: AssetNamedMap
  }
}

declare global {
  const useAsset: (typeof import('unplugin-pixi-assets/runtime'))['useAsset']

  const loadAsset: (typeof import('unplugin-pixi-assets/runtime'))['loadAsset']
}

export {}
