import chokidar from 'chokidar'
import { relative, resolve } from 'pathe'
import type {
  AssetIdsOption,
  AssetsFolderOption,
  AssetsFolderOptionResolved,
} from '../options'
import {
  appendExtensionListToPattern,
  isArray,
  toArray,
  trimExtension,
} from './utils'

export interface AssetsFolderOptions {
  src: string
  extensions: string[]
  exclude: string[]
}

export class AssetsFolderWatcher {
  src: string
  exclude: string[]
  extensions: string[] = []
  watcher: chokidar.FSWatcher
  getAssetId: (filePath: string) => string

  constructor(folderOptions: AssetsFolderOptionResolved) {
    this.src = folderOptions.src
    this.exclude = folderOptions.exclude
    this.extensions = folderOptions.extensions
    this.getAssetId = folderOptions.getAssetId

    this.watcher = chokidar.watch(folderOptions.pattern, {
      cwd: this.src,
      ignoreInitial: true,
      ignorePermissionErrors: false,
      ignored: this.exclude,
    })
  }

  on(
    event: 'add' | 'change' | 'unlink' | 'unlinkDir',
    handler: (context: HandlerContext) => void,
  ) {
    this.watcher.on(event, (filePath: string) => {
      // skip other extensions
      if (this.extensions.length > 0 && this.extensions.every(extension => !filePath.endsWith(extension)))
        return

      // ensure consistent absolute path for Windows and Unix
      filePath = resolve(this.src, filePath)

      handler({
        assetId: this.getAssetId(filePath),
        filePath,
      })
    })
    return this
  }

  close() {
    this.watcher.close()
  }
}

export interface HandlerContext {
  assetId: string
  filePath: string
}

export function resolveFolderOptions(
  folderOptions: AssetsFolderOption,
): AssetsFolderOptionResolved {
  const extensions = folderOptions.extensions || []
  const filePatterns = folderOptions.filePatterns
    ? isArray(folderOptions.filePatterns)
      ? folderOptions.filePatterns
      : [folderOptions.filePatterns]
    : ['**/*']

  const getAssetId = folderOptions.assetIds
    ? typeof folderOptions.assetIds === 'function'
      ? folderOptions.assetIds
      : createAssetIdResolver(folderOptions.assetIds)
    : (filePath: string) => filePath

  return {
    src: folderOptions.src,
    pattern:
      extensions.length > 0
        ? appendExtensionListToPattern(
          filePatterns,
          // also override the extensions if the folder has a custom extensions
          extensions,
        )
        : filePatterns,
    extensions,
    getAssetId: (filePath: string) => getAssetId(relative(folderOptions.src, filePath)),
    filePatterns,
    exclude: toArray(folderOptions.exclude || []),
  }
}

function createAssetIdResolver(
  assetIds: AssetIdsOption,
): (filePath: string) => string {
  return (filePath: string) => {
    let id = filePath

    const { prefix = '', suffix = '' } = assetIds

    if (assetIds.stripExtensions)
      id = trimExtension(id)

    if (assetIds.dotNotation)
      id = id.replace(/\//g, '.')

    return prefix + id + suffix
  }
}
