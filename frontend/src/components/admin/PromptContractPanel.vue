<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  contract: { type: Object, default: null },
})

const emit = defineEmits(['save'])
const draft = ref(null)
const templateText = ref('')
const error = ref('')

watch(
  () => props.contract,
  (contract) => {
    draft.value = contract ? structuredClone(contract) : null
    templateText.value = contract
      ? JSON.stringify(contract.constTemplate.content, null, 2)
      : ''
    error.value = ''
  },
  { immediate: true },
)

function save() {
  try {
    draft.value.constTemplate.content = JSON.parse(templateText.value)
    emit('save', structuredClone(draft.value))
    error.value = ''
  } catch {
    error.value = 'CONST_TEMPLATE يجب أن يكون JSON صحيحاً.'
  }
}
</script>

<template>
  <section v-if="draft" class="contract" dir="rtl">
    <header>
      <div>
        <strong>عقد إنشاء البرومبت</strong>
        <small>Admin authoring منفصل عن الملفات التي يحصل عليها المستخدم.</small>
      </div>
      <button type="button" @click="save">حفظ العقد</button>
    </header>
    <p v-if="error" class="error">{{ error }}</p>
    <div class="contract__grid">
      <label>
        <span>CONST_TEMPLATE.json <i>البنية المسموح للـAI بملئها</i></span>
        <textarea v-model="templateText" dir="ltr" spellcheck="false" />
      </label>
      <label>
        <span>ADMIN_MANIFESTO.md <i>تعليمات ملء الثوابت — لا تصل للمستخدم</i></span>
        <textarea v-model="draft.adminManifesto.content" dir="ltr" spellcheck="false" />
      </label>
      <label>
        <span>USER_MANIFESTO.md <i>قواعد تنفيذ التصميم النهائية</i></span>
        <textarea v-model="draft.userManifesto.content" dir="ltr" spellcheck="false" />
      </label>
    </div>
  </section>
</template>

<style scoped>
.contract { min-height: 0; background: #fff; }
.contract header { display: flex; align-items: center; justify-content: space-between; gap: 12px; min-height: 52px; padding: 8px 12px; border-bottom: 1px solid #dfdcd6; }
.contract header strong, .contract header small { display: block; }
.contract header small { margin-top: 2px; color: #777; font-size: .72rem; }
.contract button { min-height: 34px; padding: 6px 12px; border: 0; border-radius: 7px; color: #fff; background: #171717; font: inherit; font-weight: 700; cursor: pointer; }
.contract__grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; padding: 8px; }
label { display: grid; min-width: 0; gap: 5px; }
label span { font-size: .76rem; font-weight: 750; }
label i { display: block; margin-top: 2px; color: #777; font-size: .66rem; font-style: normal; font-weight: 400; }
textarea { width: 100%; min-height: calc(100dvh - 130px); padding: 9px; border: 1px solid #dcd8d1; border-radius: 8px; font: 11px/1.5 ui-monospace, SFMono-Regular, monospace; resize: none; }
.error { margin: 7px 8px 0; padding: 7px 9px; color: #8d2929; background: #fff0f0; font-size: .75rem; }
@media (max-width: 900px) { .contract__grid { grid-template-columns: 1fr; } textarea { min-height: 280px; resize: vertical; } }
@media (max-width: 560px) {
  .contract header { align-items: flex-start; padding: 7px 8px; }
  .contract header small { max-width: 230px; }
  .contract button { flex: 0 0 auto; }
  .contract__grid { gap: 10px; padding: 8px; }
  textarea { min-height: 320px; }
}
</style>
