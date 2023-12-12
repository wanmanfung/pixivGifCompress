
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
