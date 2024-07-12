# unplugin-pixi-assets

[![NPM version](https://img.shields.io/npm/v/unplugin-pixi-assets?color=a1b858&label=)](https://www.npmjs.com/package/unplugin-pixi-assets)

Load your pixi.js assets with imports.

```ts
import { Sprite } from 'pixi.js'
import texture from './bunny.png?texture'

const sprite = new Sprite(texture)
```

## Install

```bash
npm i unplugin-pixi-assets
```

<details>
<summary>Vite</summary><br>

```ts
// vite.config.ts
import PixiAssets from 'unplugin-pixi-assets/vite'

export default defineConfig({
  plugins: [
    PixiAssets({ /* options */ }),
  ],
})
```

Example: [`playground/`](./playground/)

<br></details>

<details>
<summary>Rollup</summary><br>

```ts
// rollup.config.js
import PixiAssets from 'unplugin-pixi-assets/rollup'

export default {
  plugins: [
    PixiAssets({ /* options */ }),
  ],
}
```

<br></details>


<details>
<summary>Webpack</summary><br>

```ts
// webpack.config.js
module.exports = {
  /* ... */
  plugins: [
    require('unplugin-pixi-assets/webpack')({ /* options */ })
  ]
}
```

<br></details>

<details>
<summary>Nuxt</summary><br>

```ts
// nuxt.config.js
export default defineNuxtConfig({
  modules: [
    ['unplugin-pixi-assets/nuxt', { /* options */ }],
  ],
})
```

> This module works for both Nuxt 2 and [Nuxt Vite](https://github.com/nuxt/vite)

<br></details>

<details>
<summary>Vue CLI</summary><br>

```ts
// vue.config.js
module.exports = {
  configureWebpack: {
    plugins: [
      require('unplugin-pixi-assets/webpack')({ /* options */ }),
    ],
  },
}
```

<br></details>

<details>
<summary>esbuild</summary><br>

```ts
// esbuild.config.js
import { build } from 'esbuild'
import PixiAssets from 'unplugin-pixi-assets/esbuild'

build({
  plugins: [PixiAssets()],
})
```

<br></details>

## Setup

If you have an `env.d.ts` file, add the `unplugin-pixi-assets` types to it.

```ts
// env.d.ts
/// <reference types="vite/client" />
/// <reference types="unplugin-pixi-assets/client" />
```

If you don't have an env.d.ts file, you can create one and add the unplugin-pixi-assets types to it or you can add them to the types property in your tsconfig.json:

```ts
{
  "compilerOptions": {
    // ...
    "types": ["unplugin-pixi-assets/client"]
  }
}
```
