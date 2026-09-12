<script setup>
import { computed, onMounted, ref } from 'vue'
import AdminDesignForm from '../components/admin/AdminDesignForm.vue'
import AdminDesignList from '../components/admin/AdminDesignList.vue'
import PromptContractPanel from '../components/admin/PromptContractPanel.vue'
import { useAdminDesigns } from '../composables/useAdminDesigns'

const activeTab = ref('designs')
const {
  contract,
  filteredDesigns,
  isBusy,
  isNew,
  load,
  message,
  query,
  refreshFromMockApi,
  removeDesign,
  saveContract,
  saveDesign,
  selectDesign,
  selected,
  startNew,
} = useAdminDesigns()

const selectedId = computed(() => selected.value?.id ?? '')

onMounted(load)

function confirmDelete() {
  if (window.confirm('حذف هذا التصميم من التخزين المحلي؟')) removeDesign()
}

function confirmRefresh() {
  if (window.confirm('إلغاء التغييرات المحلية وإعادة جلب Mock API؟')) {
    refreshFromMockApi()
  }
}
</script>

<template>
  <main class="admin" dir="rtl">
    <header class="admin__header">
      <RouterLink to="/" aria-label="العودة إلى المعرض">←</RouterLink>
      <strong>Prompt Design Admin</strong>
      <nav aria-label="أقسام الإدارة">
        <button type="button" :class="{ active: activeTab === 'designs' }" @click="activeTab = 'designs'">التصاميم</button>
        <button type="button" :class="{ active: activeTab === 'contract' }" @click="activeTab = 'contract'">عقد البرومبت</button>
      </nav>
      <span v-if="isBusy">جاري العمل…</span>
    </header>

    <p v-if="message" class="admin__message">{{ message }}</p>

    <section v-if="activeTab === 'designs'" class="workspace">
      <aside>
        <div class="tools">
          <input v-model="query" type="search" placeholder="بحث…" aria-label="البحث عن تصميم" />
          <button type="button" @click="startNew">+ جديد</button>
          <button type="button" title="إعادة جلب Mock API" @click="confirmRefresh">↻</button>
        </div>
        <AdminDesignList :designs="filteredDesigns" :selected-id="selectedId" @select="selectDesign" />
      </aside>

      <AdminDesignForm
        :design="selected"
        :is-new="isNew"
        :is-busy="isBusy"
        @save="saveDesign"
        @delete="confirmDelete"
      />
    </section>

    <PromptContractPanel
      v-else
      :contract="contract"
      @save="saveContract"
    />
  </main>
</template>

<style scoped>
.admin { min-height: 100dvh; color: #242321; background: #eceae5; font-size: 14px; }
.admin__header { display: flex; align-items: center; gap: 10px; min-height: 48px; padding: 6px 10px; border-bottom: 1px solid #d6d2cb; background: #fff; }
.admin__header > a { display: grid; width: 32px; height: 32px; place-items: center; border: 1px solid #d9d5ce; border-radius: 7px; color: inherit; text-decoration: none; }
.admin__header > strong { white-space: nowrap; }
.admin__header nav { display: flex; align-self: stretch; margin-inline-start: 10px; }
.admin__header nav button { padding: 0 12px; border: 0; border-bottom: 2px solid transparent; background: transparent; font: inherit; cursor: pointer; }
.admin__header nav button.active { border-color: #171717; font-weight: 750; }
.admin__header > span { margin-inline-start: auto; color: #777; font-size: .72rem; }
.admin__message { margin: 0; padding: 6px 10px; border-bottom: 1px solid #d8d4cd; color: #4f5e56; background: #edf5f0; font-size: .74rem; }
.workspace { display: grid; grid-template-columns: 310px minmax(0, 1fr); gap: 1px; min-height: calc(100dvh - 48px); background: #d6d2cb; }
.workspace aside { min-width: 0; background: #faf9f6; }
.tools { display: grid; grid-template-columns: minmax(0, 1fr) auto 34px; gap: 5px; padding: 7px; border-bottom: 1px solid #dedad3; }
.tools input, .tools button { height: 32px; border: 1px solid #d8d4cd; border-radius: 7px; background: #fff; font: inherit; }
.tools input { min-width: 0; padding: 5px 8px; }
.tools button { padding: 4px 8px; cursor: pointer; }
@media (max-width: 760px) {
  .admin__header > strong { display: none; }
  .admin__header nav { margin: 0; }
  .workspace { grid-template-columns: 1fr; }
  .workspace aside { max-height: 42dvh; overflow-y: auto; }
}
</style>
