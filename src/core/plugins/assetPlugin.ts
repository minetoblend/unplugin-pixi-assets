import type { Thenable, TransformResult } from 'unplugin'

export interface AssetPlugin {
  name: string
  load(path: string, query: Record<string, string>): Thenable<TransformResult>
}
