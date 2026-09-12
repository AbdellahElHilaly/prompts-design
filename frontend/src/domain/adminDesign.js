export function createEmptyDesign(constTemplate) {
  return {
    id: '',
    title: '',
    description: '',
    approvalRate: 100,
    preview: '',
    status: 'draft',
    demo: { title: '', html: '', css: '', js: '' },
    constants: structuredClone(constTemplate),
    sortOrder: Date.now(),
    updatedAt: new Date().toISOString(),
  }
}

export function validateAdminDesign(design) {
  const errors = []
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(design.id)) {
    errors.push('المعرّف يجب أن يكون kebab-case بالإنجليزية.')
  }
  if (!design.title.trim()) errors.push('اسم التصميم مطلوب.')
  if (!design.description.trim()) errors.push('الوصف مطلوب.')
  if (!design.preview) errors.push('صورة المعاينة مطلوبة.')
  if (design.approvalRate < 0 || design.approvalRate > 100) {
    errors.push('نسبة الإعجاب يجب أن تكون بين 0 و100.')
  }
  if (!design.demo.html.trim()) errors.push('كود HTML مطلوب للـLive demo.')
  return errors
}
