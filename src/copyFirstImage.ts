import { success, warning } from "./message"
import { loadImage } from "./utils"

export default async (path: string, text: string) => {
  const progressTips = document.createElement('div')
  progressTips.style.cssText = 'position: fixed; left: 40px; top: 120px; z-index: 99; padding: 4px 11px; border-radius: 4px; background: #fff;box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05);'
  document.body.appendChild(progressTips)
  progressTips.innerHTML = `准备中`
  const mainImg = await loadImage(path, {
    onprogress(loaded, total) {
      progressTips.innerHTML = `下载中 ===> ${loaded}/${total}`
    },
    onloadstart() {
      progressTips.innerHTML = `开始下载`
    },
  }).catch(() => {
    warning('download err')
  }).finally(() => {
    progressTips.remove()
  })
  if (!mainImg) return

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