import { ImageDownCtrl } from "./control";

declare namespace GM {
  function registerMenuCommand(name: string, callback: () => void, accessKey?: string): number | string;
  function registerMenuCommand(name: string, callback: () => void, options?: { accessKey?: string, id?: number | string, title?: string }): number | string;
  function unregisterMenuCommand(menuCmdId: number | string): void;
}


let ctrl = new ImageDownCtrl()

window.addEventListener('urlchange', (info) => {
  ctrl.changeId()
})

if (/\/artworks\//.test(location.href)) {
  ctrl.changeId()
}
