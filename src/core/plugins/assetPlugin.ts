import type { Thenable, TransformResult } from 'unplugin'

export interface AssetPlugin {
  name: string
  test(path: string): boolean
  generateAssetLoader(path: string): Thenable<TransformResult>
  getAssetInfo(path: string): AssetInfo
}

export interface AssetLoaderOptions {
  data: Record<string, any>
  alias?: string
}

export interface AssetInfo {
  assetType: string
  loaderOptionsType?: string
}
