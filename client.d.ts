declare module '*.jpg?texture' {
  const texture: import('pixi.js').Texture
  export default texture
}

declare module '*.jpeg?texture' {
  const texture: import('pixi.js').Texture
  export default texture
}

declare module '*.png?texture' {
  const texture: import('pixi.js').Texture
  export default texture
}

declare module '*&texture'{
  const texture: import('pixi.js').Texture
  export default texture
}
