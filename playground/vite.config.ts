import { defineConfig } from 'vite'
import Inspect from 'vite-plugin-inspect'
import PixiAssets from '../src/vite'

export default defineConfig({
  plugins: [
    Inspect(),
    PixiAssets({
      textures: {
        defaultOptions: {
          magFilter: 'nearest',
        },
      },
    }),
  ],
})
