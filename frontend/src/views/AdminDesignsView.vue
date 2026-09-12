<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminDesignForm from '../components/admin/AdminDesignForm.vue'
import AdminDesignList from '../components/admin/AdminDesignList.vue'
import PromptContractPanel from '../components/admin/PromptContractPanel.vue'
import { useAdminDesigns } from '../composables/useAdminDesigns'

const activeTab = ref('designs')
const mobilePane = ref('list')
const {
  contract,
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

onMounted(load)

function openDesign(design) {
  selectDesign(design)
  mobilePane.value = 'editor'
}

function createDesign() {
  startNew()
  mobilePane.value = 'editor'
}

async function saveAndStay(design) {
  await saveDesign(design)
}

async function confirmDelete() {
  if (!window.confirm('حذف هذا التصميم من هذا الجهاز؟')) return
  await removeDesign()
  mobilePane.value = 'list'
}

function confirmReset() {
  if (window.confirm('إلغاء تعديلات هذا الجهاز واستعادة بيانات JSON الأصلية؟')) {
    resetFromStaticData()
    mobilePane.value = 'list'
  }
}
</script>

<template>
  <main class="admin" dir="rtl">
    <header class="admin__header">
      <RouterLink to="/" aria-label="العودة إلى المعرض">←</RouterLink>
      <strong>الإدارة</strong>
      <nav aria-label="أقسام الإدارة">
        <button type="button" :class="{ active: activeTab === 'designs' }" @click="activeTab = 'designs'">التصاميم</button>
        <button type="button" :class="{ active: activeTab === 'contract' }" @click="activeTab = 'contract'">عقد البرومبت</button>
      </nav>
      <span v-if="isBusy">جارٍ الحفظ…</span>
    </header>

    <p v-if="message" class="admin__message">{{ message }}</p>

    <section v-if="activeTab === 'designs'" class="workspace" :class="`show-${mobilePane}`">
      <aside class="workspace__list">
        <div class="tools">
          <input v-model="query" type="search" placeholder="ابحث بالاسم أو المعرّف" aria-label="البحث عن تصميم" />
          <button class="new-button" type="button" @click="createDesign">+ جديد</button>
          <button type="button" title="استعادة بيانات JSON" aria-label="استعادة بيانات JSON" @click="confirmReset">↻</button>
        </div>
        <div class="list-summary">
          <strong>{{ filteredDesigns.length }} تصاميم</strong>
          <small>البيانات محفوظة على هذا الجهاز</small>
        </div>
        <AdminDesignList :designs="filteredDesigns" :selected-id="selectedId" @select="openDesign" />
      </aside>

      <section class="workspace__editor">
        <AdminDesignForm
          :design="selected"
          :is-new="isNew"
          :is-busy="isBusy"
          @back="mobilePane = 'list'"
          @save="saveAndStay"
          @delete="confirmDelete"
        />
      </section>
    </section>

    <PromptContractPanel v-else :contract="contract" @save="saveContract" />
  </main>
</template>

<style scoped>
.admin { min-height: 100dvh; color: #242321; background: #f5f3ef; font-size: 14px; }
.admin__header { position: sticky; top: 0; z-index: 10; display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 6px 10px; border-bottom: 1px solid #d6d2cb; background: #fff; }
.admin__header > a { display: grid; flex: 0 0 34px; width: 34px; height: 34px; place-items: center; border: 1px solid #d9d5ce; border-radius: 7px; color: inherit; text-decoration: none; }
.admin__header > strong { white-space: nowrap; }
.admin__header nav { display: flex; align-self: stretch; }
.admin__header nav button { padding: 0 10px; border: 0; border-bottom: 2px solid transparent; background: transparent; font: inherit; cursor: pointer; white-space: nowrap; }
.admin__header nav button.active { border-color: #171717; font-weight: 750; }
.admin__header > span { margin-inline-start: auto; color: #6d6a65; font-size: .7rem; white-space: nowrap; }
.admin__message { position: sticky; top: 48px; z-index: 9; margin: 0; padding: 6px 10px; border-bottom: 1px solid #d8d4cd; color: #375748; background: #edf5f0; font-size: .74rem; }
.workspace { display: grid; grid-template-columns: minmax(260px, 310px) minmax(0, 1fr); min-height: calc(100dvh - 48px); background: #d6d2cb; gap: 1px; }
.workspace__list, .workspace__editor { min-width: 0; background: #fff; }
.workspace__list { background: #faf9f6; }
.tools { display: grid; grid-template-columns: minmax(0, 1fr) auto 34px; gap: 5px; padding: 7px; border-bottom: 1px solid #dedad3; }
.tools input, .tools button { height: 34px; min-width: 0; border: 1px solid #d8d4cd; border-radius: 7px; background: #fff; font: inherit; }
.tools input { padding: 5px 8px; }
.tools button { padding: 4px 8px; cursor: pointer; }
.new-button { color: #fff; border-color: #171717 !important; background: #171717 !important; font-weight: 700 !important; }
.list-summary { display: flex; align-items: center; justify-content: space-between; gap: 8px; padding: 6px 8px; border-bottom: 1px solid #e8e5df; color: #66625c; }
.list-summary strong { font-size: .72rem; }
.list-summary small { font-size: .64rem; }
@media (max-width: 760px) {
  .admin__header { gap: 4px; padding-inline: 7px; }
  .admin__header > strong { display: none; }
  .admin__header nav { min-width: 0; flex: 1; }
  .admin__header nav button { flex: 1; padding-inline: 5px; }
  .admin__header > span { display: none; }
  .workspace { display: block; min-height: calc(100dvh - 48px); }
  .workspace__list, .workspace__editor { min-height: calc(100dvh - 48px); }
  .workspace.show-list .workspace__editor { display: none; }
  .workspace.show-editor .workspace__list { display: none; }
  .tools { position: sticky; top: 48px; z-index: 5; background: #faf9f6; }
}
@media (min-width: 761px) {
  .workspace__list { max-height: calc(100dvh - 48px); overflow: auto; }
  .workspace__editor { max-height: calc(100dvh - 48px); overflow: auto; }
}
</style>
