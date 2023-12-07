export const loadImage = (str: string): Promise<CanvasImageSource> => {
  const i = document.createElement('img')
  i.width = 900
  i.height = 200
  i.style.cssText = `
    object-fit: contain;
  `
  return new Promise((res) => {
    i.onload = () => {
      res(i)
    }
    i.src = str
  })
}

export const resizeImageSource = async (source: CanvasImageSource, w: number, h: number): Promise<CanvasImageSource> => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  canvas.height = h
  canvas.width = w

  ctx.drawImage(source, 0, 0, w, h)

  return canvas
}