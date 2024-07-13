import { promises as fs } from 'node:fs'
import fg from 'fast-glob'
import { relative, resolve } from 'pathe'
import type { Thenable, TransformResult } from 'unplugin'
import { generateAssetNamedMap } from '../codegen/generateAssetNamedMap'
import { generateDTS as _generateDTS } from '../codegen/generateDTS'
import { generateLoadAsset } from '../codegen/generateLoadAsset'
import { generateUseAsset } from '../codegen/generateUseAsset'
import type { ResolvedOptions } from '../options'
import type { HandlerContext } from './AssetsFolderWatcher'
import { AssetsFolderWatcher, resolveFolderOptions } from './AssetsFolderWatcher'
import { AssetStore } from './AssetStore'
import { ASSETS_MODULE, parseId } from './moduleConstants'
import { useAssetTransform } from './useAsset'
import { throttle } from './utils'

export function createContext(options: ResolvedOptions) {
  const { dts: preferDTS, root, assetsFolder, plugins } = options
  const dts
    = preferDTS === false
      ? false
      : preferDTS === true
        ? resolve(root, 'pixi-assets.d.ts')
        : resolve(root, preferDTS)

  const logger = new Proxy(console, {
    get(target, prop) {
      const res = Reflect.get(target, prop)
      if (typeof res === 'function')
        return options.logs ? res : () => {}

      return res
    },
  })

  const assetStore = new AssetStore(options)

  const watchers: AssetsFolderWatcher[] = []

  async function scanAssets(startWatchers = true) {
    // initial scan was already done
    if (watchers.length > 0)
      return

    await Promise.all(
      assetsFolder
        .map(folder => resolveFolderOptions(folder))
        .map(async (folder) => {
          if (startWatchers)
            watchers.push(setupWatcher(new AssetsFolderWatcher(folder)))

          // the ignore option must be relative to cwd or absolute
          const ignorePattern = folder.exclude.map(f =>
            // if it starts with ** then it will work as expected
            f.startsWith('**') ? f : relative(folder.src, f),
          )

          return fg(folder.pattern, {
            cwd: folder.src,
            ignore: ignorePattern,
          })
            .then(files =>
              Promise.all(
                files
                // ensure consistent files in Windows/Unix and absolute paths
                  .map(file => resolve(folder.src, file))
                  .map(file => addAsset({
                    assetId: folder.getAssetId(file),
                    filePath: file,
                  })),
              ),
            )
        }),
    )

    await _writeConfigFiles()
  }

  function resolvePlugin(filePath: string) {
    return plugins.find(p => p.test(filePath))
  }

  async function addAsset({ assetId, filePath }: HandlerContext) {
    const plugin = resolvePlugin(filePath)

    if (plugin) {
      logger.log(`added "${assetId}" for "${filePath}"`)
      assetStore.add(assetId, filePath, plugin)
    }
  }

  // eslint-disable-next-line unused-imports/no-unused-vars
  async function updateAsset(ctx: HandlerContext) {
    // TODO: update asset
  }

  async function removeAsset({ assetId, filePath }: HandlerContext) {
    if (assetStore.remove(assetId))
      logger.log(`removed "${assetId}" for "${filePath}"`)
  }

  function generateDTS(): string {
    return _generateDTS({
      assetsModule: ASSETS_MODULE,
      assetNamedMap: generateAssetNamedMap(assetStore),
    })
  }

  let lastDTS: string | undefined

  async function _writeConfigFiles() {
    logger.time('writeConfigFiles')

    if (dts) {
      const content = generateDTS()
      if (lastDTS !== content) {
        await fs.writeFile(dts, content, 'utf-8')
        logger.timeLog('writeConfigFiles', 'wrote dts file')
        lastDTS = content
      }
    }
    logger.timeEnd('writeConfigFiles')
  }

  const writeConfigFiles = throttle(_writeConfigFiles, 500, 100)

  function setupWatcher(watcher: AssetsFolderWatcher) {
    return watcher
      .on('change', async (ctx) => {
        await updateAsset(ctx)
        writeConfigFiles()
      })
      .on('add', async (ctx) => {
        await addAsset(ctx)
        writeConfigFiles()
      })
      .on('unlink', (ctx) => {
        removeAsset(ctx)
        writeConfigFiles()
      })
  }

  function stopWatcher() {
    if (watchers.length) {
      logger.log('🛑 stopping watcher')
      watchers.forEach(watcher => watcher.close())
    }
  }

  return {
    scanAssets,
    writeConfigFiles,

    stopWatcher,

    useAssetTransform(code: string, id: string): Thenable<TransformResult> {
      return useAssetTransform({
        code,
        id,
      })
    },
    generateUseAsset(id: string) {
      const { query } = parseId(id)

      return generateUseAsset(query.id, query.opts ? JSON.parse(query.opts) : undefined)
    },
    generateLoadAsset(id: string) {
      return generateLoadAsset(id, assetStore)
    },
  }
}
