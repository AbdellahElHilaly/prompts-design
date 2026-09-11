function formatList(items) {
  return items.map((item, index) => `${index + 1}. ${item}`).join('\n')
}

function formatManifesto({ content }) {
  return `# ${content.title}

**Priority:** ${content.priority}

## Conflict policy

${content.conflictPolicy}

## Non-negotiable directives

${formatList(content.directives)}

## Delivery contract

${formatList(content.deliveryRules)}
`
}

function formatUserRequest({ content }) {
  const { fields } = content
  return `# User Request

> ${content.instructions}

- **Application type:** ${fields.applicationType}
- **Target platform:** ${fields.targetPlatform}
- **Technology stack:** ${fields.technologyStack.join(', ')}

## Functional requirements

${formatList(fields.functionalRequirements)}

## Technical constraints

${formatList(fields.technicalConstraints)}
`
}

export function createPromptFiles(promptKit) {
  return [
    {
      name: promptKit.files.manifesto.filename,
      content: formatManifesto(promptKit.files.manifesto),
    },
    {
      name: promptKit.files.constants.filename,
      content: `${JSON.stringify(promptKit.files.constants.content, null, 2)}\n`,
    },
    {
      name: promptKit.files.userRequest.filename,
      content: formatUserRequest(promptKit.files.userRequest),
    },
  ]
}

export function mergePromptFiles(files) {
  const sections = files.map((file, index) => {
    const language = file.name.endsWith('.json') ? 'json' : 'markdown'
    return `## FILE ${index + 1}: ${file.name}

\`\`\`${language}
${file.content.trim()}
\`\`\``
  })

  return `# AI Frontend Design Package

Read and execute the files in the exact order shown below. Earlier files have higher priority. Treat each file boundary as authoritative.

${sections.join('\n\n---\n\n')}
`
}
