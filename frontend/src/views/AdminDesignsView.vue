<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import AdminDesignForm from '../components/admin/AdminDesignForm.vue'
import AdminDesignList from '../components/admin/AdminDesignList.vue'
import AdminSidebar from '../components/admin/AdminSidebar.vue'
import PromptContractPanel from '../components/admin/PromptContractPanel.vue'
import { useAdminDesigns } from '../composables/useAdminDesigns'
import { createPromptFiles, mergePromptFiles } from '../domain/promptPackage'
import { getDesignPromptKit } from '../repositories/designRepository'

const router = useRouter()
const screen = ref('list')
const editorSection = ref('info')
const sidebarOpen = ref(false)
const {
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
} = useAdminDesigns()

const selectedId = computed(() => selected.value?.id ?? '')
const screenTitle = computed(() => {
  if (screen.value === 'contract') return 'عقد البرومبت'
  if (screen.value === 'editor') return selected.value?.title || 'تصميم جديد'
  return 'التصاميم'
})

onMounted(load)

function closeSidebar() {
  sidebarOpen.value = false
}

function openEditor(section = 'info', design) {
  if (design) selectDesign(design)
  if (!selected.value) return
  editorSection.value = section
  screen.value = 'editor'
  closeSidebar()
}

function createDesign() {
  startNew()
  editorSection.value = 'info'
  screen.value = 'editor'
  closeSidebar()
}

async function deleteSelected() {
  if (!selected.value || isNew.value) return
  if (!window.confirm(`حذف «${selected.value.title}» من هذا الجهاز؟`)) return
  await removeDesign()
  screen.value = 'list'
  closeSidebar()
}

function duplicateSelected() {
  duplicateDesign()
  editorSection.value = 'info'
  screen.value = 'editor'
  closeSidebar()
}

async function copySelectedJson() {
  if (!selected.value) return
  try {
    await navigator.clipboard.writeText(JSON.stringify(selected.value, null, 2))
    message.value = 'تم نسخ JSON الخاص بالتصميم.'
  } catch {
    message.value = 'تعذر النسخ إلى الحافظة.'
  }
  closeSidebar()
}

async function copySelectedPrompt() {
  if (!selected.value || isNew.value) {
    message.value = 'احفظ التصميم أولاً قبل نسخ البرومبت.'
    return
  }
  try {
    const kit = await getDesignPromptKit(selected.value.id)
    await navigator.clipboard.writeText(mergePromptFiles(createPromptFiles(kit)))
    message.value = 'تم نسخ البرومبت كاملاً.'
  } catch {
    message.value = 'تعذر تجهيز البرومبت.'
  }
  closeSidebar()
}

function openLiveDemo() {
  if (!selected.value || isNew.value) {
    message.value = 'احفظ التصميم أولاً قبل فتح المعاينة.'
    return
  }
  const url = router.resolve({ name: 'demo', params: { designId: selected.value.id } }).href
  window.open(url, '_blank', 'noopener,noreferrer')
  closeSidebar()
}

function confirmReset() {
  if (!window.confirm('إلغاء تعديلات هذا الجهاز واستعادة بيانات JSON الأصلية؟')) return
  resetFromStaticData()
  screen.value = 'list'
  closeSidebar()
}

function runAction(action, design) {
  if (design) selectDesign(design)
  const handlers = {
    list: () => { screen.value = 'list'; closeSidebar() },
    create: createDesign,
    info: () => openEditor('info'),
    image: () => openEditor('image'),
    demo: () => openEditor('demo'),
    'live-demo': openLiveDemo,
    prompt: () => openEditor('prompt'),
    'copy-prompt': copySelectedPrompt,
    duplicate: duplicateSelected,
    'copy-json': copySelectedJson,
    delete: deleteSelected,
    contract: () => { screen.value = 'contract'; closeSidebar() },
    reset: confirmReset,
  }
  handlers[action]?.()
}

function runRowAction({ design, action }) {
  runAction(action, design)
}
</script>

<template>
  <main class="admin-shell" dir="rtl">
    <header class="navbar">
      <button class="menu-button" type="button" aria-label="فتح قائمة العمليات" @click="sidebarOpen = true">☰</button>
      <div class="navbar__title">
        <strong>{{ screenTitle }}</strong>
        <small v-if="screen === 'editor'">{{ editorSection }}</small>
      </div>
      <span v-if="isBusy" class="busy">جارٍ الحفظ…</span>
      <button class="navbar__add" type="button" aria-label="إضافة تصميم" @click="createDesign">+</button>
      <RouterLink to="/" aria-label="العودة إلى المعرض">←</RouterLink>
    </header>

    <AdminSidebar
      :open="sidebarOpen"
      :has-selection="Boolean(selected)"
      @close="closeSidebar"
      @action="runAction"
    />

    <section class="main-area">
      <p v-if="message" class="admin-message">{{ message }}</p>

      <template v-if="screen === 'list'">
        <div class="list-toolbar">
          <div>
            <h1>كل التصاميم</h1>
            <small>{{ filteredDesigns.length }} عناصر · اضغط على أي تصميم لتعديله</small>
          </div>
          <button type="button" @click="createDesign">+ إضافة تصميم</button>
        </div>
        <label class="search">
          <span class="sr-only">البحث</span>
          <input v-model="query" type="search" placeholder="ابحث بالاسم أو المعرّف…" />
        </label>
        <AdminDesignList
          :designs="filteredDesigns"
          :selected-id="selectedId"
          @select="(design) => openEditor('info', design)"
          @action="runRowAction"
        />
      </template>

      <AdminDesignForm
        v-else-if="screen === 'editor'"
        :design="selected"
        :section="editorSection"
        :is-new="isNew"
        :is-busy="isBusy"
        @back="screen = 'list'"
        @save="saveDesign"
        @delete="deleteSelected"
      />

      <PromptContractPanel v-else :contract="contract" @save="saveContract" />
    </section>
  </main>
</template>

<style scoped>
.admin-shell { display: grid; grid-template: 52px minmax(0, 1fr) / minmax(0, 1fr) 220px; grid-template-areas: "navbar navbar" "main sidebar"; min-height: 100dvh; color: #282724; background: #eeece7; font-size: 14px; }
.navbar { grid-area: navbar; z-index: 20; display: flex; align-items: center; gap: 8px; padding: 7px 10px; border-bottom: 1px solid #d8d4cd; background: #fff; }
.navbar button, .navbar > a { display: grid; width: 36px; height: 36px; flex: 0 0 36px; place-items: center; border: 1px solid #d8d4cd; border-radius: 7px; color: inherit; background: #fff; text-decoration: none; font: inherit; cursor: pointer; }
.navbar .menu-button { display: none; font-size: 1rem; }
.navbar__title { min-width: 0; }
.navbar__title strong, .navbar__title small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.navbar__title strong { font-size: .88rem; }
.navbar__title small { color: #817d76; font-size: .6rem; }
.navbar .navbar__add { margin-inline-start: auto; color: #fff; border-color: #252421; background: #252421; font-size: 1.15rem; }
.busy { margin-inline-start: auto; color: #76726c; font-size: .68rem; }
.busy + .navbar__add { margin-inline-start: 0; }
.main-area { grid-area: main; min-width: 0; max-height: calc(100dvh - 52px); overflow: auto; background: #fff; }
.admin-message { position: sticky; z-index: 8; top: 0; margin: 0; padding: 7px 11px; border-bottom: 1px solid #d8d4cd; color: #375748; background: #edf5f0; font-size: .72rem; }
.list-toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 64px; padding: 10px 12px; }
.list-toolbar h1 { margin: 0; font-size: 1rem; }
.list-toolbar small { display: block; margin-top: 3px; color: #77736d; font-size: .68rem; }
.list-toolbar button { min-height: 34px; padding: 5px 10px; border: 0; border-radius: 7px; color: #fff; background: #252421; font: inherit; font-size: .76rem; font-weight: 750; cursor: pointer; }
.search { display: block; padding: 0 10px 9px; }
.search input { width: 100%; height: 36px; padding: 6px 10px; border: 1px solid #d8d4cd; border-radius: 7px; background: #faf9f6; font: inherit; }
@media (max-width: 800px) {
  .admin-shell { display: block; min-width: 0; }
  .navbar { position: sticky; top: 0; height: 52px; padding-inline: 7px; }
  .navbar .menu-button { display: grid; }
  .navbar__title { flex: 1; }
  .busy { display: none; }
  .navbar .navbar__add { margin-inline-start: 0; }
  .main-area { max-height: none; min-height: calc(100dvh - 52px); overflow: visible; }
  .list-toolbar { min-height: 58px; padding: 8px; }
  .list-toolbar button { display: none; }
  .search { position: sticky; z-index: 7; top: 52px; padding: 7px 8px; border-block: 1px solid #e2dfd9; background: #fff; }
}
</style>
