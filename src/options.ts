import process from 'node:process'
import { resolve } from 'pathe'
import { isPackageExists as isPackageInstalled } from 'local-pkg'
import { type AssetPluginId, soundPlugin } from './core/plugins'
import type { AssetPlugin } from './core/plugins/assetPlugin'
import type { TexturePluginOptions } from './core/plugins/texturePlugin'
import { texturePlugin } from './core/plugins/texturePlugin'
import { isArray, warn } from './core/utils'

export interface AssetsFolderOption {
  /**
   * The folder to scan for asset files. Supports glob patterns but must be a folder, use
   * `extensions` and `exclude` to filter files.
   */
  src: string

  /**
   * Allows to customize the generated asset ids. Can be a function for custom formatting.
   * Defaults to the asset path relative to `src`.
   *
   * @example ```js
   * {
   *   src: 'src/assets/textures',
   *   assetIds: {
   *     prefix: 'texture:',
   *     stripExtensions: true,
   *     dotNotation: true,
   *   }
   * }
   * ```
   */
  assetIds?: AssetIds

  /**
   * Pattern to match files to scan for assets in. Defaults to `**‍/*` plus a combination of all the possible extensions,
   * e.g. `**‍/*.{png,jpg,jpeg}` if `extensions` is set to `.{png,jpg,jpeg}`
   * @default `['‍‍‍*‍*‍‍‍/*']`
   */
  filePatterns?: string[] | string

  /**
   * Array of `picomatch` globs to ignore. Note the globs are relative to the cwd, so avoid writing
   * something like `['ignored']` to match folders named that way, instead provide a path similar to the assets folder:
   * `['src/pages/ignored/**']` or use `['**​/ignored']` to match every folder named `ignored`.
   * @default `[]`
   */
  exclude?: string[] | string

  /**
   * Extensions of files to be considered as assets. If empty will match all files.
   * @default `[]`
   */

  extensions?: string[]
  plugins?: (AssetPluginId | AssetPlugin)[]
}

type AssetsFolder = string | AssetsFolderOption

export interface AssetIdsOption {
  prefix?: string
  stripExtensions?: boolean
  dotNotation?: boolean
  suffix?: string
}

export interface AssetsFolderOptionResolved extends AssetsFolderOption {
  getAssetId: (filepath: string) => string
  /**
   * Final glob pattern to match files in the folder.
   */
  pattern: string[]
  filePatterns: string[]
  exclude: string[]
  extensions: string[]
}

export type AssetIds = AssetIdsOption | ((filePath: string) => string)

export interface Options {
  /**
   * Folder(s) to scan for asset files. Can be an array if you want to add multiple folders,
   * or an object if you want to specify additional options. Supports glob patterns but must
   * be a folder.
   *
   * @default 'src/assets'
   */
  assetsFolder?: AssetsFolder | AssetsFolder[]

  /**
   * Extensions for files to scan for asset imports in. Cannot be empty.
   *
   * @default ['.{jsx?,tsx?}']
   */
  extensions?: string[]

  /**
   * Array of `picomatch` globs to ignore. Note the globs are relative to the cwd, so avoid writing
   * something like `['ignored']` to match folders named that way, instead provide a path similar to the `routesFolder`:
   * `['src/assets/ignored/**']` or use `['**​/ignored']` to match every folder named `ignored`.
   *
   * @default `[]`
   */
  exclude?: string[] | string

  /**
   * Pattern to match files to scan for `useAsset` calls in. Defaults to `**‍/*` plus a combination of all the possible extensions,
   * e.g. `**‍/*.{ts,js}` if `extensions` is set to `['.ts', '.js']`.
   * @default `['‍‍‍*‍*‍‍‍/*']`
   */
  filePatterns?: string[] | string

  /**
   * The root directory of the project. All paths are resolved relative to this one.
   * @default `process.cwd()`
   */
  root?: string

  /**
   * Should we generate d.ts files or ont. Defaults to `true` if `typescript` is installed. Can be set to a string of
   * the filepath to write the d.ts files to. By default it will generate a file named `pixi-assets.d.ts`.
   * @default `true`
   */
  dts?: boolean | string

  /**
   * Enable logs for debugging purposes.
   */
  logs?: boolean

  /**
   * Whether to watch the asset files for changes.
   *
   * Defaults to `true` unless the `CI` environment variable is set.
   *
   * @default `!process.env.CI`
   */
  watch?: boolean

  /**
   * Plugins to use for asset handling.
   *
   * @default `['textures']`
   */
  plugins?: (AssetPluginId | AssetPlugin)[]

  /**
   * Options for the `textures` plugin.
   */
  textures?: TexturePluginOptions
}

function defaultPlugins() {
  const plugins: AssetPluginId[] = ['textures']

  if (isPackageInstalled('@pixi/sound'))
    plugins.push('sounds')

  return plugins
}

export const DEFAULT_OPTIONS = {
  extensions: ['.{png,jpg,jpeg,gif,webp,svg,bmp}'],
  exclude: [],
  assetsFolder: 'src/assets',
  filePatterns: ['**/*'],
  root: process.cwd(),
  dts: isPackageInstalled('typescript'),
  plugins: defaultPlugins(),
  logs: false,
  watch: !process.env.CI,
  textures: {},
} satisfies Options

function resolvePlugin(
  plugin: AssetPlugin | AssetPluginId,
  options: Options,
): AssetPlugin {
  if (typeof plugin === 'string') {
    switch (plugin) {
      case 'textures':
        return texturePlugin(options.textures)
      case 'sounds':
        return soundPlugin()
      default:
        throw new Error(`Unknown asset plugin: ${plugin}`)
    }
  }
  return plugin
}

export function normalizeAssetsFolderOption(
  option: AssetsFolder | AssetsFolder[],
): AssetsFolderOption[] {
  return (isArray(option) ? option : [option]).map(assetsFolder =>
    normalizeAssetsFolder(
      typeof assetsFolder === 'string' ? { src: assetsFolder } : assetsFolder,
    ),
  )
}

function normalizeAssetsFolder(folder: AssetsFolderOption): AssetsFolderOption {
  return {
    exclude: [],
    extensions: [],
    ...folder,
  }
}

export function resolveOptions(options: Options) {
  const root = options.root || DEFAULT_OPTIONS.root

  const assetsFolder = normalizeAssetsFolderOption(
    options.assetsFolder || DEFAULT_OPTIONS.assetsFolder,
  ).map(folder => ({
    ...folder,
    src: resolve(root, folder.src),
  }))

  if (options.extensions) {
    options.extensions = options.extensions
      // ensure that extensions start with a dot or warn the user
      // this is needed when filtering the files with the pattern .{png,jpg,jpeg}
      .map((ext) => {
        if (!ext.startsWith('.')) {
          warn(`Invalid extension "${ext}". Extensions must start with a dot.`)
          return `.${ext}`
        }
        return ext
      })
      // sort extensions by length to ensure that the longest one is used first
      .sort((a, b) => b.length - a.length)
  }

  const filePatterns = options.filePatterns
    ? isArray(options.filePatterns)
      ? options.filePatterns
      : [options.filePatterns]
    : DEFAULT_OPTIONS.filePatterns
  const exclude = options.exclude
    ? isArray(options.exclude)
      ? options.exclude
      : [options.exclude]
    : DEFAULT_OPTIONS.exclude

  const plugins = (options.plugins || DEFAULT_OPTIONS.plugins).map(plugin =>
    resolvePlugin(plugin, options),
  )

  return {
    ...DEFAULT_OPTIONS,
    ...options,
    plugins,
    assetsFolder,
    filePatterns,
    exclude,
  }
}

export type ResolvedOptions = ReturnType<typeof resolveOptions>
