import { Application, Sprite, Ticker } from 'pixi.js'
import bunnyTexture from './assets/bunny.png?texture'

const app = new Application()

await app.init({
  width: 800,
  height: 600,
  background: 0x1099BB,
  antialias: true,
  autoDensity: true,
  resolution: window.devicePixelRatio,
})

const bunny = new Sprite({
  texture: bunnyTexture,
  scale: 5,
  anchor: 0.5,
})

bunny.x = app.screen.width / 2
bunny.y = app.screen.height / 2

app.stage.addChild(bunny)

Ticker.shared.add((ticker) => {
  bunny.rotation += 0.1 * ticker.deltaTime
})

document.body.appendChild(app.canvas)
