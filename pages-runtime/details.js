// Temporary adapter for branch-based GitHub Pages.
// The canonical Vue implementation lives in DesignDetailsDialog.vue and DemoView.vue.
const designIdFromPreview = (image) => {
  const filename = new URL(image.src, window.location.href).pathname.split('/').pop()
  return filename?.replace(/\.webp$/i, '')
}

function addLiveDemo(dialog) {
  const content = dialog.querySelector('.details__content')
  const copyButton = content?.querySelector('.details__copy')
  const image = dialog.querySelector('.details__preview')
  if (!content || !copyButton || !image || content.querySelector('.pages-details-actions')) return

  const actions = document.createElement('div')
  actions.className = 'pages-details-actions'

  const demoButton = document.createElement('button')
  demoButton.className = 'pages-details-demo'
  demoButton.type = 'button'
  demoButton.textContent = 'Live demo'
  demoButton.addEventListener('click', () => {
    const designId = designIdFromPreview(image)
    if (!designId) return
    const url = new URL('./demo.html', window.location.href)
    url.searchParams.set('id', designId)
    window.open(url, '_blank', 'noopener,noreferrer')
  })

  copyButton.replaceWith(actions)
  actions.append(demoButton, copyButton)
}

const observer = new MutationObserver(() => {
  document.querySelectorAll('dialog.details[open]').forEach(addLiveDemo)
})

observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['open'],
})
