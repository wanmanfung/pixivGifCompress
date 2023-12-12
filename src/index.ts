import copyFirstImage from "./copyFirstImage";
import { warning } from "./message";
import render from "./renderGif";

declare namespace GM {
  function registerMenuCommand(name: string, callback: () => void, accessKey?: string): number | string;
  function registerMenuCommand(name: string, callback: () => void, options?: { accessKey?: string, id?: number | string, title?: string }): number | string;
  function unregisterMenuCommand(menuCmdId: number | string): void;
}

const renderAndDownload = async (id: string) => {
  const { data, radix } = await render(id)
  const url = window.URL.createObjectURL(data)
  const download_link = document.createElement('a')
  download_link.download = `${id}_${radix.toFixed(2)}.gif`
  download_link.href = url
  download_link.click()
}

const downloadGif = () => {
  const { pathname } = location
  const arr = pathname.split('/')
  renderAndDownload(arr[arr.length - 1]).catch(e => {
    warning(e.toString())
  })
}

const copyImage = () => {
  const { pathname } = location
  const arr = pathname.split('/')
  const id = arr[arr.length - 1]
  copyFirstImage(id)
}

let gifCommand: number | string | undefined
const gifTips = 'resize and download gif'

let firstCommand: number | string | undefined
const firstCommandTips = 'copy first image'

window.addEventListener('urlchange', (info) => {
  const url = (info as unknown as { url: string }).url
  if (/\/artworks\//.test(url)) {
    gifCommand = GM.registerMenuCommand(gifTips, downloadGif)
    firstCommand = GM.registerMenuCommand(firstCommandTips, copyImage)
  } else {
    gifCommand && GM.unregisterMenuCommand(gifCommand)
    firstCommand && GM.unregisterMenuCommand(firstCommand)
  }
})

if (/\/artworks\//.test(location.href)) {
  gifCommand = GM.registerMenuCommand(gifTips, downloadGif)
  firstCommand = GM.registerMenuCommand(firstCommandTips, copyImage)
}
