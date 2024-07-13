import { relative } from 'pathe'
import type { ResolvedOptions } from '../options'
import type { AssetPlugin } from './plugins'
import type { AssetInfo } from './plugins/assetPlugin'

export class AssetStore {
  root: string

  constructor(options: ResolvedOptions) {
    this.root = options.root
  }

  readonly assets = new Map<string, AssetRecord>()

  add(assetId: string, filePath: string, plugin: AssetPlugin) {
    this.assets.set(assetId, {
      ...plugin.getAssetInfo(filePath),
      id: assetId,
      filePath: `/${relative(this.root, filePath)}`,
      plugin,
    })

    return null
  }

  remove(assetId: string): boolean {
    return this.assets.delete(assetId)
  }
}

export interface AssetRecord extends AssetInfo {
  id: string
  filePath: string
  plugin: AssetPlugin
}
