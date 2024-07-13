import { ASSETS_MODULE } from '../core/moduleConstants'

export function generateUseAsset(
  assetId: string,
  options: Record<string, any>,
) {
  return `
import loader from '${ASSETS_MODULE}/loadAsset?id=${assetId}'

export default await loader(${options ? JSON.stringify(options) : ''})
`.trimStart()
}
