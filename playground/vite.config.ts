import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import TopLevelAwait from 'vite-plugin-top-level-await'
import PixiAssets from '../src/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    TopLevelAwait(),
    PixiAssets(),
  ],
})
