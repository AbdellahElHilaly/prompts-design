import { computed, ref } from 'vue'
import { createEmptyDesign, validateAdminDesign } from '../domain/adminDesign'
import {
  deleteAdminDesign,
  getAdminPromptContract,
  listAdminDesigns,
  resetAdminDesigns,
  saveAdminDesign,
  saveAdminPromptContract,
} from '../repositories/adminDesignRepository'

export function useAdminDesigns() {
  const designs = ref([])
  const selected = ref(null)
  const contract = ref(null)
  const isNew = ref(false)
  const isBusy = ref(false)
  const message = ref('')
  const query = ref('')

  const filteredDesigns = computed(() => {
    const needle = query.value.trim().toLocaleLowerCase()
    if (!needle) return designs.value
    return designs.value.filter((design) =>
      `${design.title} ${design.id}`.toLocaleLowerCase().includes(needle),
    )
  })

  async function load() {
    isBusy.value = true
    try {
      ;[designs.value, contract.value] = await Promise.all([
        listAdminDesigns(),
        getAdminPromptContract(),
      ])
      if (!selected.value && designs.value.length) selectDesign(designs.value[0])
    } catch {
      message.value = 'تعذر تحميل بيانات لوحة الإدارة.'
    } finally {
      isBusy.value = false
    }
  }

  function selectDesign(design) {
    selected.value = structuredClone(design)
    isNew.value = false
    message.value = ''
  }

  function startNew() {
    selected.value = createEmptyDesign(contract.value.constTemplate.content)
    isNew.value = true
    message.value = ''
  }

  function duplicateDesign(design = selected.value) {
    if (!design) return
    const baseId = `${design.id}-copy`
    let nextId = baseId
    let suffix = 2
    while (designs.value.some((item) => item.id === nextId)) {
      nextId = `${baseId}-${suffix}`
      suffix += 1
    }
    selected.value = {
      ...structuredClone(design),
      id: nextId,
      title: `${design.title} — نسخة`,
      status: 'draft',
      sortOrder: Date.now(),
    }
    isNew.value = true
    message.value = 'تم إنشاء نسخة غير محفوظة. عدّلها ثم اضغط حفظ.'
  }

  async function saveDesign(design) {
    const errors = validateAdminDesign(design)
    if (errors.length) {
      message.value = errors[0]
      return false
    }
    if (isNew.value && designs.value.some((item) => item.id === design.id)) {
      message.value = 'هذا المعرّف مستعمل من قبل.'
      return false
    }

    isBusy.value = true
    try {
      const normalized = {
        ...design,
        demo: { ...design.demo, title: design.title },
      }
      await saveAdminDesign(normalized)
      designs.value = await listAdminDesigns()
      selectDesign(designs.value.find((item) => item.id === design.id))
      message.value = 'تم حفظ التصميم محلياً.'
      return true
    } catch {
      message.value = 'تعذر الحفظ. قد تكون مساحة تخزين المتصفح ممتلئة.'
      return false
    } finally {
      isBusy.value = false
    }
  }

  async function removeDesign() {
    if (!selected.value || isNew.value) return
    try {
      await deleteAdminDesign(selected.value.id)
      designs.value = await listAdminDesigns()
      selected.value = designs.value[0] ? structuredClone(designs.value[0]) : null
      message.value = 'تم حذف التصميم.'
    } catch {
      message.value = 'تعذر حذف التصميم من هذا الجهاز.'
    }
  }

  async function resetFromStaticData() {
    isBusy.value = true
    try {
      designs.value = await resetAdminDesigns()
      selected.value = designs.value[0] ? structuredClone(designs.value[0]) : null
      isNew.value = false
      message.value = 'تمت استعادة بيانات JSON الأصلية.'
    } catch {
      message.value = 'تعذرت استعادة بيانات JSON.'
    } finally {
      isBusy.value = false
    }
  }

  async function saveContract(value) {
    await saveAdminPromptContract(value)
    contract.value = structuredClone(value)
    message.value = 'تم حفظ عقد البرومبت محلياً.'
  }

  return {
    contract,
    duplicateDesign,
    filteredDesigns,
    isBusy,
    isNew,
    load,
    message,
    query,
    resetFromStaticData,
    removeDesign,
    saveContract,
    saveDesign,
    selectDesign,
    selected,
    startNew,
  }
}
