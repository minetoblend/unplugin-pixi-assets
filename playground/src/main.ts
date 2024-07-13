import { Application, Sprite, Ticker } from 'pixi.js'

const app = new Application()

await app.init({
  preference: 'webgl',
  resizeTo: window,
  background: 0x1099BB,
  antialias: true,
  autoDensity: true,
  resolution: window.devicePixelRatio,
})

const texture = useAsset('textures/bunny.png', {
  magFilter: 'nearest',
})

const sprite = new Sprite({
  texture,
  scale: 2,
  anchor: 0.5,
})

sprite.x = app.screen.width / 2
sprite.y = app.screen.height / 2

app.stage.addChild(sprite)

Ticker.shared.add((ticker) => {
  sprite.rotation += 0.01 * ticker.deltaTime
})

document.body.appendChild(app.canvas)
