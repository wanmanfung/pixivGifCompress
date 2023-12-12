import text, { success, warning } from "./message"
import { gifWorker } from './gif.worker'
import { resizeImageSource } from "./utils"
import type jszip from "jszip";
import type gif from "gif.js";
import { MAX_SIZE } from "./config";

declare class JSZip extends jszip { }
declare class GIF extends gif { }

const getWorker = () => {
  const b = new Blob([gifWorker])
  return window.URL.createObjectURL(b)
}


async function load(id: string) {

  const closeDownloading = text('downloading...')
  const meta: metaData = await fetch(`https://www.pixiv.net/ajax/illust/${id}/ugoira_meta?lang=zh`).then(res => {
    return res.json()
  })

  if (meta.error) {
    throw meta.message
  }

  const file = await fetch(meta.body.src).then(res => {
    return res.blob()
  })
  closeDownloading()
  const closeDrawing = text('drawing...')

  let size = 1

  while (file.size * size > MAX_SIZE) {
    size *= 0.9
  }

  const zipFile = await new JSZip().loadAsync(file)

  success('rendering...')

  let b = await draw(meta, zipFile, { resize: size })
  let count = 1

  if (b.size > MAX_SIZE) {
    closeDrawing()
  }

  let cloasResizingMessage: () => void = () => { }
  while (b.size > MAX_SIZE) {
    size *= 0.9
    while (b.size * size > MAX_SIZE) {
      size *= 0.9
    }
    cloasResizingMessage()
    cloasResizingMessage = warning('resizing...')
    b = await draw(meta, zipFile, { resize: size })
    count++
  }
  success('ready')
  return {
    data: b,
    radix: size,
  }
}

const draw = async (meta: metaData, file: JSZip, options?: {
  resize?: number
}) => {
  const imgDatas = await Promise.all(meta.body.frames.map(async i => {
    const blob = await file.file(i.file)?.async('blob')!
    const imgElement: ImageBitmap = await createImageBitmap(blob!)
    return {
      delay: i.delay,
      name: i.file,
      imgElement: await resizeImageSource(imgElement, imgElement.width * (options?.resize || 1), imgElement.height * (options?.resize || 1))
    }
  }))


  const gif = new GIF({
    workers: 2,
    quality: 5,
    workerScript: getWorker(),
  })

  imgDatas.forEach(i => {
    gif.addFrame(i.imgElement, { delay: i.delay })
  })

  return new Promise<Blob>(res => {
    gif.on('finished', function (blob) {
      res(blob)
    });

    gif.render()
  })
}

export default load