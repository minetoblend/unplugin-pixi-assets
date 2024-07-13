export function generateDTS({
  assetsModule,
  assetNamedMap,
}: {
  assetsModule: string
  assetNamedMap: string
}): string {
  return `
/* eslint-disable */
/* prettier-ignore */
// @ts-nocheck
// Generated by unplugin-pixi-assets. ‼️ DO NOT MODIFY THIS FILE ‼️
// It's recommended to commit this file.
// Make sure to add this file to your tsconfig.json file as an "includes" or "files" entry.

declare module '${assetsModule}' {
  import type {
    AssetRecordInfo
  } from 'unplugin-pixi-assets/runtime'

  /**
   * Assets list generated by unplugin-pixi-assets. 
   */
${
  assetNamedMap.split('\n')
    .filter(line => line.length > 0)
    .map(line => `  ${line}`)
    .join('\n')
}
}
`.trimStart()
}
