export function warn(
  msg: string,
  type: 'warn' | 'error' | 'debug' = 'warn',
): void {
  // eslint-disable-next-line no-console
  console[type](`⚠️  [unplugin-pixi-assets]: ${msg}`)
}

export const isArray: (arg: ArrayLike<any> | any) => arg is ReadonlyArray<any>
  = Array.isArray

export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value]
}

export function trimExtension(
  path: string,
) {
  return path.replace(/\.\w+$/, '')
}

export function appendExtensionListToPattern(
  filePatterns: string,
  extensions: string[]
): string
export function appendExtensionListToPattern(
  filePatterns: string[],
  extensions: string[]
): string[]
export function appendExtensionListToPattern(
  filePatterns: string | string[],
  extensions: string[],
): string[] | string {
  const extensionPattern
    = extensions.length === 1
      ? extensions[0]
      : `.{${extensions
          .map(extension => extension.replace('.', ''))
          .join(',')}}`

  return Array.isArray(filePatterns)
    ? filePatterns.map(filePattern => `${filePattern}${extensionPattern}`)
    : `${filePatterns}${extensionPattern}`
}

export function throttle(fn: () => void, wait: number, initialWait: number) {
  let pendingExecutionTimeout: ReturnType<typeof setTimeout> | null = null
  let pendingExecution = false
  let executionTimeout: ReturnType<typeof setTimeout> | null = null

  return () => {
    if (pendingExecutionTimeout == null) {
      pendingExecutionTimeout = setTimeout(() => {
        pendingExecutionTimeout = null
        if (pendingExecution) {
          pendingExecution = false
          fn()
        }
      }, wait)
      executionTimeout = setTimeout(() => {
        executionTimeout = null
        fn()
      }, initialWait)
    }
    else if (executionTimeout == null) {
      // we run the function recently, so we can skip it and add a pending execution
      pendingExecution = true
    }
  }
}
