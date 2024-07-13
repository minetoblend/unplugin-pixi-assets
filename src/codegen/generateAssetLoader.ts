export function generateAssetLoader(
  options: AssetLoaderOptions,
) {
  const lines: string[] = []

  if (options.alias)
    lines.push(`alias: ${JSON.stringify(options.alias)}`)
  if (options.loadParser)
    lines.push(`loadParser: ${JSON.stringify(options.loadParser)}`)
  if (options.defaultOptions)
    lines.push(`data: { ...${JSON.stringify(options.defaultOptions)}, ...options }`)
  else
    lines.push('data: options')

  return `
import { Assets } from "pixi.js";
import textureUrl from ${JSON.stringify(options.path)};
const loader = (options = {}) => Assets.load({
  src: textureUrl,${
    lines.map(it => `  ${it}`).join(',\n')
}
})

export default loader
`
}

export interface AssetLoaderOptions {
  path: string
  alias?: string
  loadParser?: string
  defaultOptions?: Record<string, any>
}
