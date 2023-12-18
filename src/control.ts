import copyFirstImage from "./copyFirstImage"
import { warning } from "./message"
import render from "./renderGif";

export class ImageDownCtrl {
  id: string

  original?: string
  imgMeta?: requestBody['body']
  pageCount = 0

  images: string[] = []

  multiSelector: HTMLSelectElement

  downloadBtn: HTMLButtonElement

  constructor() {
    const { pathname } = location
    const arr = pathname.split('/')
    this.id = arr[arr.length - 1]

    this.getImageData()

    this.multiSelector = document.createElement('select')
    this.multiSelector.style.cssText = 'position: fixed; left: 40px; top: 80px; z-index: 99; padding: 4px 11px; width: 120px; border-radius: 4px; '

    this.downloadBtn = document.createElement('button')
    this.downloadBtn.innerHTML = 'download GIF'
    this.downloadBtn.style.cssText = 'position: fixed; left: 40px; top: 100px; z-index: 99; padding: 4px 11px; width: 120px; border-radius: 4px; background: #fff;'
  }

  changeId() {
    const { pathname } = location
    this.downloadBtn.remove()
    this.multiSelector.remove()
    const arr = pathname.split('/')
    const id = arr[arr.length - 1]

    if (id === this.id) return
    this.id = id
    this.getImageData()
  }

  async getImageData() {
    const source: response & requestBody = await fetch(`https://www.pixiv.net/ajax/illust/${this.id}`).then(res => res.json())
    if (source.error) throw source.error
    this.imgMeta = source.body
    this.id = source.body.illustId
    this.pageCount = source.body.pageCount
    this.original = this.imgMeta.urls.original

    if (this.imgMeta.illustType === 0) {
      this.multiImages()
    }

    if (this.imgMeta.illustType === 2) {
      this.ugoira()
    }
  }

  async ugoira() {
    this.downloadBtn.onclick = async () => {
      this.downloadBtn.disabled = true
      const { data, radix } = await render(this.id)
      const url = window.URL.createObjectURL(data)
      const download_link = document.createElement('a')
      download_link.download = `${this.id}_${radix.toFixed(2)}.gif`
      download_link.href = url
      download_link.click()
      this.downloadBtn.disabled = false
    }
    document.body.appendChild(this.downloadBtn)
  }

  async multiImages() {
    const pages: response & { body: { urls: { original: string } }[] } = await fetch(`https://www.pixiv.net/ajax/illust/${this.id}/pages?lang=zh`).then(res => res.json())
    if (pages.error) throw pages.error
    this.images = pages.body.map(i => i.urls.original)

    this.multiSelector.innerHTML = '<option value="" disabled selected hidden>选择...</option>'
    for (let i = 0; i < this.pageCount; i++) {
      const opt = document.createElement('option')
      opt.value = i.toString()
      opt.style.cssText = 'padding: 4px 11px;'
      opt.text = opt.value
      this.multiSelector.appendChild(opt)
    }
    this.multiSelector.value = ''

    this.multiSelector.onchange = () => {
      this.multiSelector.disabled = true
      this.drawImage(parseInt(this.multiSelector.value)).then(() => {
        this.multiSelector.disabled = false
        this.multiSelector.value = ''
      })
    }
    document.body.appendChild(this.multiSelector)
  }

  async drawImage(idx: number) {
    if (!this.images[idx]) {
      warning('图片未加载')
      return
    }
    await copyFirstImage(this.images[idx], `https://www.pixiv.net/artworks/${this.id}`)
  }
}