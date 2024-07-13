import type { AssetStore } from '../core/AssetStore'
import { parseId } from '../core/moduleConstants'

export function generateLoadAsset(
  id: string,
  store: AssetStore,
) {
  const { query } = parseId(id)

  const assetId = query.id

  const asset = store.assets.get(assetId)

  if (!asset)
    throw new Error(`Asset not found: "${assetId}"`)

  return asset.plugin.generateAssetLoader(asset.filePath)
}
