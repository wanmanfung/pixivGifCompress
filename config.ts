import project from './package.json' assert { type: "json" };

export default {
  "name": "压缩下载Pixiv gif图片",
  "icon": "https://www.google.com/s2/favicons?sz=64&domain=pixiv.net",
  "require": [
    "https://cdn.jsdelivr.net/npm/gif.js.optimized@1.0.1/dist/gif.min.js",
    "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.7.1/jszip.min.js"
  ],
  "run-at": "document-start",
  "match": [
    "https://www.pixiv.net/*"
  ],
  "author": project.author,
  "description": project.description,
  "version": project.version,
  "grant": [
    "window.onurlchange",
    "GM_registerMenuCommand",
    "GM_unregisterMenuCommand"
  ]
}