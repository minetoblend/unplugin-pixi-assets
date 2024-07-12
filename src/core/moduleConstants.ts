export function parseId(id: string) {
  const index = id.indexOf('?')
  if (index < 0)
    return { path: id, query: {} }

  const query = Object.fromEntries(new URLSearchParams(id.slice(index)))
  return { path: id.slice(0, index), query }
}
