export const loadImage = (str: string): Promise<HTMLImageElement> => {
  const i = document.createElement('img')
  i.crossOrigin = 'anonymous'
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

export function isArtworkPage(url: string) {
  return /\/artworks\//.test(url)
}

export async function getPages(id: string) {
  const pages: response & { body: { urls: { original: string } }[] } = await fetch(`https://www.pixiv.net/ajax/illust/${id}/pages?lang=zh`).then(res => res.json())
  if (pages.error) throw pages.error

  return pages.body
}

export const createSelector = (options: {
  src: string,
  label: string
}[]) => {
  const multiSelector = document.createElement('select')
  multiSelector.style.cssText = 'position: fixed; left: 40px; top: 80px; z-index: 99; padding: 4px 11px; width: 120px; border-radius: 4px; '

  multiSelector.innerHTML = '<option value="" disabled selected hidden>选择...</option>'
  for (let i = 0; i < options.length; i++) {
    const opt = document.createElement('option')
    opt.value = options[i].src
    opt.text = options[i].label
    multiSelector.appendChild(opt)
  }
  multiSelector.value = ''

  return multiSelector
}