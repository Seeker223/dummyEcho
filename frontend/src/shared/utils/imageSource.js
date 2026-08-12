export function imageSource(image) {
  if (!image) return ''
  if (typeof image === 'string') return image
  if (typeof image.src === 'string') return image.src
  return ''
}

