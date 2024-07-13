export interface AssetRecordInfo<Name extends string = string, Path extends string = string, Type extends object = object, Options extends object = Record<string, any>> {
  name: Name
  path: Path
  type: Type
  options: Options
}

export interface TypesConfig {}

export type GenericAssetMap = Record<string, AssetRecordInfo>

export type AssetMap = TypesConfig extends Record<'AssetNamedMap', infer T> ? T : GenericAssetMap

export type UnwrapAssetType<Name extends keyof AssetMap> = AssetMap[Name]['type']

export type UnwrapAssetOptions<Name extends keyof AssetMap> = AssetMap[Name]['options']

// eslint-disable-next-line unused-imports/no-unused-vars
export function useAsset<Name extends keyof AssetMap>(id: Name, options?: UnwrapAssetOptions<Name>): UnwrapAssetType<Name> {
  throw new Error('unplugin-pixi-assets plugin is not installed. Make sure to add `unplugin-pixi-assets` to your Vite config plugins.')
}

// eslint-disable-next-line unused-imports/no-unused-vars
export function loadAsset<Name extends keyof AssetMap>(id: Name, options?: UnwrapAssetOptions<Name>): Promise<UnwrapAssetType<Name>> {
  throw new Error('unplugin-pixi-assets plugin is not installed. Make sure to add `unplugin-pixi-assets` to your Vite config plugins.')
}
