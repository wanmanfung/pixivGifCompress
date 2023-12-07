import { warning } from "./message";
import render from "./renderGif";

const renderAndDownload = async (id: string) => {
  const { data, radix } = await render(id)
  const url = window.URL.createObjectURL(data)
  const download_link = document.createElement('a')
  download_link.download = `${id}_${radix.toFixed(2)}.gif`
  download_link.href = url
  download_link.click()
}

window.addEventListener('keydown', (e) => {
  console.log('dcdvcd');

  if (e.key === 'c' && e.ctrlKey) {
    const { pathname } = location
    const arr = pathname.split('/')
    renderAndDownload(arr[arr.length - 1]).catch(e => {
      console.log(e);
      warning(e.toString())
    })
  }
})
