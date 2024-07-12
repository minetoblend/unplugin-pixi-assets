import type { TransformResult } from 'unplugin'
import type { ResolvedOptions } from '../options'

export function createContext(options: ResolvedOptions) {
  const plugins = options.plugins

  async function load(id: string, query: Record<string, string>): Promise<TransformResult> {
    for (const plugin of plugins) {
      const result = await plugin.load(id, query)
      if (result)
        return result
    }

    return null
  }

  return {
    load,
  }
}
