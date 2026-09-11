const PHONE_MAX = 699
const TABLET_MAX = 1279

export function getBatchSize(viewportWidth) {
  if (viewportWidth <= PHONE_MAX) return 6
  if (viewportWidth <= TABLET_MAX) return 9
  return 12
}
