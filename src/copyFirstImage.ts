import { success, warning } from "./message"
import { loadImage } from "./utils"

export default async (path: string, text: string) => {
  const mainImg = await loadImage(path)

  let { width, height } = mainImg
  while (width > 2000 || height > 2000) {
    width *= 0.9
    height *= 0.9
  }

  const cvs = document.createElement('canvas')
  const ctx = cvs.getContext('2d')
  if (!ctx) return
  cvs.width = width
  const fz = Math.min(52, Math.floor(cvs.width / 40))
  cvs.height = height + fz * 1.3
  ctx.drawImage(mainImg, 0, 0, width, height)
  ctx.font = `${fz}px serif`
  ctx.fillStyle = '#fff'
  ctx.textBaseline = 'bottom'
  ctx.fillText(text, 20, cvs.height - 5)
  cvs.toBlob((blob) => {
    if (!blob) {
      warning('toblob err')
      return
    }
    const data = new ClipboardItem({
      [blob.type]: blob
    })
    navigator.clipboard.write([data]).then(() => {
      success('copied to clipboard', 3000)
    }).catch(e => {
      warning(e.toString())
    })
  })
}