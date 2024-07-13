import type {
  ArrayExpression,
  CallExpression,
  Identifier,
  Literal,
  Node,
  ObjectExpression,
} from 'acorn'
import { parse } from 'acorn'
import { walk } from 'estree-walker'
import MagicString from 'magic-string'
import type { Thenable, TransformResult } from 'unplugin'
import {
  ASSETS_MODULE,
} from './moduleConstants'

const MACRO_USE_ASSET = 'useAsset'
const MACRO_LOAD_ASSET = 'loadAsset'

export function useAssetTransform({
  code,
}: {
  code: string
  id: string
}): Thenable<TransformResult> {
  const s = new MagicString(code)

  injectAssets(s)

  if (s.hasChanged()) {
    return {
      code: s.toString(),
      map: s.generateMap(),
    }
  }

  return null
}

function injectAssets(code: MagicString) {
  const ast = parse(code.original, {
    sourceType: 'module',
    ecmaVersion: 'latest',
    locations: true,
  })

  const useStatements: {
    importPath?: string
    importName: string
    node: CallExpression
  }[] = []

  const loadStatements: {
    importPath?: string
    importName: string
    idArg: Literal
    options?: ObjectExpression
    node: CallExpression
  }[] = []

  function trackAsset(node: CallExpression, type: 'useAsset' | 'loadAsset') {
    const [idArg, optionsArg] = node.arguments
    if (!idArg)
      return

    if (idArg.type !== 'Literal')
      throw new Error('Asset id must be a string literal')

    const assetId = (idArg as Literal).value as string

    if (typeof assetId !== 'string')
      throw new Error('Asset id must be a string')

    let importName = `__use_asset_${useStatements.length}__`

    if (type === 'useAsset') {
      let options: Record<string, any> | undefined

      if (optionsArg) {
        if (optionsArg.type !== 'ObjectExpression')
          throw new Error('Options must be an object')

        const object = optionsArg as ObjectExpression

        options = extractOptions(object) as Record<string, any>
      }

      let importPath:
        | string
        | undefined = `${ASSETS_MODULE}/useAsset?id=${assetId}${
        options ? `&opts=${JSON.stringify(options)}` : ''
      }`

      const matchingStatement = useStatements.find(
        s => s.importPath === importPath,
      )
      if (matchingStatement) {
        importPath = undefined
        importName = matchingStatement.importName
      }

      useStatements.push({
        importPath,
        importName,
        node,
      })
    }
    else if (type === 'loadAsset') {
      let importPath:
        | string
        | undefined = `${ASSETS_MODULE}/loadAsset?id=${assetId}`

      if (loadStatements.some(s => s.importPath === importPath))
        importPath = undefined

      if (optionsArg && optionsArg.type !== 'ObjectExpression')
        throw new Error('Options must be an object')

      loadStatements.push({
        importPath,
        importName,
        idArg,
        options: optionsArg,
        node,
      })
    }
  }

  walk(ast, {
    enter(node, parent) {
      switch (node.type) {
        case 'Identifier':
          switch (parent?.type) {
            case 'CallExpression': {
              const ident = node as Identifier
              const call = parent as CallExpression
              if (
                call.callee === node
                || call.arguments.includes(node as Identifier)
              ) {
                if (ident.name === MACRO_USE_ASSET)
                  trackAsset(call, 'useAsset')
                if (ident.name === MACRO_LOAD_ASSET)
                  trackAsset(call, 'loadAsset')
              }
              break
            }
          }
      }
    },
  })

  for (const { importPath, importName, node } of useStatements) {
    if (importPath)
      code.prependRight(0, `import ${importName} from '${importPath}'\n`)

    code.overwrite(node.start, node.end, importName)
  }

  for (const { importPath, importName, node, idArg, options } of loadStatements) {
    if (importPath)
      code.prependRight(0, `import ${importName} from '${importPath}'\n`)

    code.overwrite(node.callee.start, node.callee.end, importName)
    code.remove(idArg.start, options?.start ?? idArg.end)
  }
}

function extractOptions(node: Node): any {
  if (node.type === 'Literal')
    return (node as Literal).value

  if (node.type === 'ObjectExpression') {
    const obj: Record<string, any> = {}
    for (const prop of (node as ObjectExpression).properties) {
      if (prop.type === 'Property') {
        const key = prop.key
        if (key.type === 'Identifier')
          obj[(key as Identifier).name] = extractOptions(prop.value)
      }
    }

    return obj
  }

  if (node.type === 'ArrayExpression') {
    return (node as ArrayExpression).elements.map((el) => {
      if (el)
        return extractOptions(el)

      return undefined
    })
  }

  throw new Error('Options must be known at compile time')
}
