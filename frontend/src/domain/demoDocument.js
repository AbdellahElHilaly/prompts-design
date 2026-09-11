function escapeText(value) {
  return String(value).replace(/[&<>"]/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
  })[character])
}

export function composeDemoDocument({ title, html, css, js }) {
  const safeCss = css.replace(/<\/style/gi, '<\\/style')
  const safeJs = js.replace(/<\/script/gi, '<\\/script')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeText(title)}</title>
  <style>${safeCss}</style>
</head>
<body>
  ${html}
  <script>${safeJs}<\/script>
</body>
</html>`
}
