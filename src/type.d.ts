
declare interface response {
  error: boolean
  message: string
}

declare interface metaData extends response {
  body: {
    frames: { file: string, delay: number }[]
    mime_type: string
    originalSrc: string
    src: string
  }
}

interface requestBody {
  body: {
    illustId: string
    illustType: number
    pageCount: number
    urls: {
      "mini": string
      "thumb": string
      "small": string
      "regular": string
      "original": string
    }
  }
}

interface requestOptions extends RequestInfo {

}
declare function GM_xmlhttpRequest(opt: requestOptions)