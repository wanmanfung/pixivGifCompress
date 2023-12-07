import { successIcon, warningIcon } from "./icon"

type messageMethod = (str: string, duration?: number) => () => void

class message {
  private dom
  private text
  private icon

  private shown = false

  constructor() {
    this.dom = document.createElement('div')
    this.text = document.createElement('div')
    this.icon = document.createElement('div')
    this.dom.style.cssText = `
      position: fixed;
      left: 20px; top: 0;
      border-radius: 4px;
      font-size: 14px;

      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 6px;
      
      padding: 6px 16px;
      border: 4px; 
      
      background: #fff;
      box-shadow: rgba(0, 0, 0, 0.08) 0px 6px 5px 0px, rgba(0, 0, 0, 0.12) 0px 3px 6px -4px, rgba(0, 0, 0, 0.05) 0px 0px 12px 5px;
      
      z-index: 1000;
      transition: all .4s`
    this.load()
  }

  show() {
    setTimeout(() => {
      this.shown = true
      this.dom.style.setProperty('top', '40px')
    }, 20);
  }

  close() {
    if (!this.shown) return
    setTimeout(() => {
      this.dom.style.setProperty('top', '0')
      this.dom.style.setProperty('opacity', '0')
      this.shown = false
      setTimeout(() => {
        this.remove()
      }, 1000);
    }, 0);
  }

  private load() {
    this.dom.appendChild(this.icon)
    this.dom.appendChild(this.text)
    document.body.appendChild(this.dom)
  }

  private remove() {
    // document.body.removeChild(this.dom)
  }

  setMessage(html: string) {
    this.text.innerHTML = html
  }

  setIcon(html: string) {
    this.icon.innerHTML = html
  }
}

const showMessage = (config?: {
  message?: string
  icon?: string
  duration?: number
}) => {
  const duration = config?.duration ?? 2000
  const ins = new message()
  config?.message && ins.setMessage(config.message)
  config?.icon && ins.setIcon(config.icon)
  ins.show()

  if (duration) {
    setTimeout(() => {
      ins.close()
    }, duration);
  }

  return () => {
    ins.close()
  }
}

const text: messageMethod = (message, duration) => {
  return showMessage({
    message,
    duration
  })
}

export const success: messageMethod = (message, duration) => {
  return showMessage({
    message,
    duration,
    icon: `<div style='color: #52C41A; display: flex;'>${successIcon}</div>`
  })
}

export const warning: messageMethod = (message, duration) => {
  return showMessage({
    message,
    duration,
    icon: `<div style='color: #4096ff; display: flex;'>${warningIcon}</div>`
  })
}


export default text