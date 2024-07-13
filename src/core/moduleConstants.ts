export const ASSETS_MODULE = 'virtual:pixi-assets'

export function parseId(id: string) {
  const index = id.indexOf('?')
  if (index < 0)
    return { path: id, query: {} }

  const query = Object.fromEntries(new URLSearchParams(id.slice(index)))
  return { path: id.slice(0, index), query }
}

export const MACRO_USE_ASSSET_QUERY = /\/useAsset\b/
export const MACRO_LOAD_ASSSET_QUERY = /\/loadAsset\b/

export const VIRTUAL_PREFIX = '/__'

export function asVirtualId(id: string) {
  return VIRTUAL_PREFIX + id
}

export function getVirtualId(id: string) {
  return id.startsWith(VIRTUAL_PREFIX) ? id.slice(VIRTUAL_PREFIX.length) : null
}
