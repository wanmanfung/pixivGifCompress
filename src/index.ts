import { ImageDownCtrl } from "./control";
import copyFirstImage from "./copyFirstImage";
import { createSelector, getPages, isArtworkPage } from "./utils";

declare namespace GM {
  function registerMenuCommand(name: string, callback: () => void, accessKey?: string): number | string;
  function registerMenuCommand(name: string, callback: () => void, options?: { accessKey?: string, id?: number | string, title?: string }): number | string;
  function unregisterMenuCommand(menuCmdId: number | string): void;
}


let ctrl = new ImageDownCtrl()

window.addEventListener('urlchange', (info) => {
  ctrl.changeId()
})

if (isArtworkPage(location.href)) {
  ctrl.changeId()
}

window.addEventListener('contextmenu', e => {
  let element: HTMLElement | null = e.target as HTMLElement

  while (element && !(element as HTMLAnchorElement).href) {
    element = element.parentElement
  }

  if (element?.tagName.toLocaleLowerCase() !== 'a') return

  const a = element as HTMLAnchorElement

  if (!a.href || !isArtworkPage(a.href)) return

  e.stopPropagation()
  e.preventDefault()

  const arr = a.href.split('/')
  const id = arr[arr.length - 1]
  getPages(id).then(pages => {
    if (pages.length === 1) {
      copyFirstImage(pages[0].urls.original, a.href)
      return
    }

    const selector = createSelector(pages.map(({ urls }, i) => {
      return {
        src: urls.original,
        label: i.toString()
      }
    }))

    selector.style.position = 'absolute'
    selector.style.left = `${e.pageX}px`
    selector.style.top = `${e.pageY}px`

    selector.onclick = e => {
      e.stopPropagation()
    }

    selector.onchange = (e) => {
      e.stopPropagation()
      console.log(selector.value);
      copyFirstImage(selector.value, a.href)
    }

    document.body.appendChild(selector)

    const handle = () => {
      selector.remove()
      window.removeEventListener('click', handle)
    }
    window.addEventListener('click', handle)

  })

})