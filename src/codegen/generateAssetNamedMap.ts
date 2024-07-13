import type { AssetStore } from '../core/AssetStore'

export function generateAssetNamedMap(assetStore: AssetStore): string {
  const assets
    = [...assetStore.assets.values()]
      .map((asset) => {
        return `"${asset.id}": AssetRecordInfo<"${asset.id}", "${asset.filePath}", ${asset.assetType}, ${asset.loaderOptionsType || 'never'}>`
      })

  return `
export interface AssetNamedMap {
${
  assets
    .filter(line => line.length > 0)
    .map(line => `  ${line}`)
    .join('\n')
}
}
`.trimStart()
}
