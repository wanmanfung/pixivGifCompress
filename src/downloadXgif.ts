import { gifWorker } from './gif.worker'
import type gif from "gif.js";

// ==UserScript==
// @name         wmslj之超几把弱智下载推特gif
// @version      仅适用于2025-05-07版本的x，不知道什么时候会被他搞似
// @description  左上角添加一个按钮，点击之后检查页面中渲染的gif组件，目前看到推的gif是直接写src的，视频是<source/>的，所以检测到有src属性的video之后就会在视频左上角添加下载按钮
// @author       恁叠
// @require      https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.min.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js
// @match        https://x.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=twimg.com
// @grant        window.onurlchange
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @grant        GM_xmlhttpRequest
// @run-at       document-start
// ==/UserScript==

declare class GIF extends gif { }

const getWorker = () => {
  const b = new Blob([gifWorker])
  return window.URL.createObjectURL(b)
}


const getImageFromTimeStamp = (video: HTMLVideoElement, timpstamp: number) => {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  return new Promise<CanvasImageSource>((res, rej) => {
    video.currentTime = timpstamp / 1000
    video.onseeked = () => {
      if (!ctx) {
        rej()
        return
      }
      ctx.clearRect(0, 0, video.videoWidth, video.videoHeight)

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      res(canvas)
    }
  })
}

const video2gif = (video: HTMLVideoElement, event: {
  onStart(): void
  onEnd(data: Blob): void
}) => {
  const duration = video.duration * 1000
  const step = 1000 / 15

  const getData = async () => {
    const data = [
      await getImageFromTimeStamp(video, 0)
    ]
    for (let i = step; i <= duration; i += step) {
      data.push(
        await getImageFromTimeStamp(video, i)
      )
    }
    return data
  }

  getData().then(res => {
    event.onStart()
    const gifencoder = new GIF({
      workers: 5,
      quality: 1,
      workerScript: getWorker(),
    })
    res.forEach(data => {
      gifencoder.addFrame(data, { delay: step })
    })
    gifencoder.on('finished', function (data) {
      event.onEnd(data)
    });

    gifencoder.on('abort', () => {
      console.info('[wmslj] gif编码 abort')
    })

    gifencoder.render()
  })
}

const createDownloadBtn = (video: HTMLVideoElement) => {
  const btn = document.createElement('button')
  btn.innerText = 'download'
  btn.onclick = () => {
    video2gif(video, {
      onStart() {
        btn.innerText = 'rendering'
        btn.disabled = true
      },
      onEnd(data) {
        btn.innerText = 'completed, wait for download'
        btn.disabled = false
        const url = window.URL.createObjectURL(data)
        const download_link = document.createElement('a')
        const path = location.pathname.split('/')
        download_link.download = path[path.length - 1] + `.gif`
        download_link.href = url
        download_link.click()
      },
    })
  }

  return btn
}

const getVideoElement = (url: string, opt?: {
  onprogress?(loaded: number, total: number): void
  onloadstart?(): void
}): Promise<HTMLVideoElement> => {
  console.info(`[wmslj] 开始下载 => ${url}`)
  return new Promise((res, rej) => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: url,
      headers: {
        referer: 'https://x.com/'
      },
      responseType: 'blob',
      onload(e: { response: Blob }) {
        console.info(`[wmslj] 下载成功 => ${url}`)
        const b = e.response
        const i = document.createElement('video')
        i.crossOrigin = 'anonymous'
        i.muted = true
        i.style.cssText = `
          object-fit: contain;
        `
        i.oncanplay = () => {
          res(i)
        }
        i.src = window.URL.createObjectURL(b)
      },
      onloadstart() {
        opt?.onloadstart?.()
      },
      onprogress(e: { loaded: number; total: number }) {
        opt?.onprogress?.(e.loaded, e.total)
      },
      onerror(e: unknown) {
        console.info(`[wmslj] 下载错误 => ${url}`)
        rej(e)
      }
    })
  })
}

const setButtonStyle = (button: HTMLElement) => {
  button.style.setProperty('font-size', '10px')
  button.style.setProperty('background', 'white')
  button.style.setProperty('padding', '4px 12px')
  button.style.setProperty('box-shadow', `0 6px 16px 0 rgba(0, 0, 0, 0.08),
      0 3px 6px -4px rgba(0, 0, 0, 0.12),
      0 9px 28px 8px rgba(0, 0, 0, 0.05)`)
}

(function () {
  const btn = document.createElement('button')
  btn.style.setProperty('position', 'fixed')
  btn.style.setProperty('z-index', '99999')
  btn.style.setProperty('top', '12px')
  btn.style.setProperty('left', '12px')
  setButtonStyle(btn)
  btn.innerText = 'find video'

  btn.onclick = () => {
    const containers = Array.from(document.querySelectorAll(`div[data-testid="videoComponent"]`))
    containers.forEach(ele => {
      const video = ele.getElementsByTagName('video')[0]
      if (video && video.src) {
        getVideoElement(video.src).then(res => {
          const b = createDownloadBtn(res)
          b.style.setProperty('position', 'absolute')
          b.style.setProperty('top', '12px')
          b.style.setProperty('left', '12px')
          b.style.setProperty('z-index', '20')
          setButtonStyle(b)
          ele.appendChild(b)
        })

      }
    })
  }

  document.body.appendChild(btn)
})();