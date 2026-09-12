<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  design: { type: Object, default: null },
  isNew: { type: Boolean, default: false },
  isBusy: { type: Boolean, default: false },
  section: { type: String, default: 'info' },
})

const emit = defineEmits(['save', 'delete', 'back'])
const draft = ref(null)
const constantsText = ref('')
const codeTab = ref('html')
const activeSection = ref('info')
const localError = ref('')

watch(
  () => props.design,
  (design) => {
    draft.value = design ? structuredClone(design) : null
    constantsText.value = design ? JSON.stringify(design.constants, null, 2) : ''
    localError.value = ''
  },
  { immediate: true },
)

watch(
  () => props.section,
  (section) => { activeSection.value = section },
  { immediate: true },
)

const previewUrl = computed(() => {
  if (!draft.value?.preview) return ''
  return draft.value.preview.startsWith('data:')
    ? draft.value.preview
    : `${import.meta.env.BASE_URL}${draft.value.preview}`
})

async function setPreview(event) {
  const file = event.target.files?.[0]
  if (!file) return
  if (!file.type.startsWith('image/') || file.size > 3 * 1024 * 1024) {
    localError.value = 'استعمل صورة لا تتجاوز 3MB.'
    return
  }
  const bitmap = await createImageBitmap(file)
  if (Math.abs(bitmap.width / bitmap.height - 4 / 3) > 0.02) {
    bitmap.close()
    localError.value = 'صورة المعاينة يجب أن تكون بنسبة 4:3.'
    return
  }
  const scale = Math.min(1, 1200 / bitmap.width, 900 / bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  draft.value.preview = canvas.toDataURL('image/webp', 0.82)
  bitmap.close()
  localError.value = ''
}

function submit() {
  try {
    draft.value.constants = JSON.parse(constantsText.value)
    localError.value = ''
    emit('save', structuredClone(draft.value))
  } catch {
    localError.value = 'CONSTS يجب أن يكون JSON صحيحاً.'
  }
}
</script>

<template>
  <form v-if="draft" class="editor" @submit.prevent="submit">
    <header class="editor__bar">
      <button class="back" type="button" aria-label="العودة إلى قائمة التصاميم" @click="$emit('back')">←</button>
      <strong>{{ isNew ? 'تصميم جديد' : draft.title }}</strong>
      <select v-model="draft.status" aria-label="حالة التصميم">
        <option value="draft">draft</option>
        <option value="published">published</option>
      </select>
      <div class="editor__actions">
        <button v-if="!isNew" class="danger" type="button" @click="$emit('delete')">حذف</button>
        <button class="primary" type="submit" :disabled="isBusy">حفظ</button>
      </div>
    </header>

    <p v-if="localError" class="error">{{ localError }}</p>

    <nav class="editor-tabs" aria-label="أقسام التصميم">
      <button type="button" :class="{ active: activeSection === 'info' }" @click="activeSection = 'info'">المعلومات</button>
      <button type="button" :class="{ active: activeSection === 'image' }" @click="activeSection = 'image'">الصورة</button>
      <button type="button" :class="{ active: activeSection === 'demo' }" @click="activeSection = 'demo'">Demo</button>
      <button type="button" :class="{ active: activeSection === 'prompt' }" @click="activeSection = 'prompt'">البرومبت</button>
    </nav>

    <section v-show="activeSection === 'info'" class="fields fields--meta">
      <label>المعرّف<input v-model.trim="draft.id" :readonly="!isNew" placeholder="design-id" /></label>
      <label>الاسم<input v-model.trim="draft.title" placeholder="اسم التصميم" /></label>
      <label>نسبة الإعجاب<input v-model.number="draft.approvalRate" type="number" min="0" max="100" /></label>
      <label class="wide">الوصف<textarea v-model.trim="draft.description" rows="2" /></label>
    </section>

    <section v-show="activeSection === 'image'" class="asset-panel">
      <img v-if="previewUrl" :src="previewUrl" alt="معاينة التصميم" />
      <div v-else class="asset-placeholder">4:3</div>
      <div>
        <strong>صورة بطاقة التصميم</strong>
        <p>نسبة 4:3، وسيتم ضغطها تلقائياً قبل الحفظ.</p>
        <label class="upload">اختيار صورة<input type="file" accept="image/png,image/jpeg,image/webp" @change="setPreview" /></label>
      </div>
    </section>

    <section v-show="activeSection === 'demo'" class="code-editor">
      <nav>
        <button v-for="tab in ['html', 'css', 'js']" :key="tab" type="button" :class="{ active: codeTab === tab }" @click="codeTab = tab">{{ tab.toUpperCase() }}</button>
      </nav>
      <textarea v-model="draft.demo[codeTab]" dir="ltr" spellcheck="false" :aria-label="`كود ${codeTab}`" />
    </section>

    <label v-show="activeSection === 'prompt'" class="const-editor">
      <span>CONSTS.json</span>
      <small>ثوابت التصميم التي ستدخل في حزمة البرومبت.</small>
      <textarea v-model="constantsText" dir="ltr" spellcheck="false" />
    </label>
  </form>
  <div v-else class="empty">اختر تصميماً أو أنشئ واحداً جديداً.</div>
</template>

<style scoped>
.editor { display: grid; width: 100%; min-width: 0; align-content: start; background: #fff; }
.editor__bar { position: sticky; top: 0; z-index: 2; display: flex; align-items: center; gap: 8px; min-height: 48px; padding: 7px 10px; border-bottom: 1px solid #dfdcd6; background: #fff; }
.editor__bar strong { min-width: 0; margin-inline-end: auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.editor__actions { display: flex; gap: 6px; }
.back { display: none; }
button, select, input, textarea { font: inherit; }
button, select { min-height: 32px; border: 1px solid #d9d5ce; border-radius: 7px; background: #fff; }
button { padding: 5px 10px; cursor: pointer; }
.primary { border-color: #171717; color: #fff; background: #171717; }
.danger { color: #a33838; }
.fields { display: grid; gap: 9px; padding: 10px; }
.fields--meta { grid-template-columns: 1fr 1fr 120px; }
label { display: grid; gap: 4px; color: #625f5a; font-size: .74rem; font-weight: 650; }
input, textarea { width: 100%; border: 1px solid #dcd8d1; border-radius: 7px; color: #171717; background: #fff; }
input { height: 34px; padding: 6px 8px; }
textarea { padding: 8px; resize: vertical; line-height: 1.45; }
.wide { grid-column: 1 / -1; }
.asset-row { display: grid; grid-template-columns: 112px auto; align-items: center; gap: 10px; padding: 0 10px 10px; }
.asset-row img, .asset-placeholder { width: 112px; height: 84px; border-radius: 8px; object-fit: cover; }
.asset-placeholder { display: grid; place-items: center; color: #888; background: #eeece7; }
.upload { width: max-content; padding: 8px 10px; border: 1px solid #d9d5ce; border-radius: 7px; cursor: pointer; }
.upload input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.code-editor, .const-editor { margin: 0 10px 10px; }
.code-editor { overflow: hidden; border: 1px solid #dcd8d1; border-radius: 8px; }
.code-editor nav { display: flex; gap: 2px; padding: 4px; border-bottom: 1px solid #dcd8d1; background: #f5f3ef; }
.code-editor nav button { min-height: 28px; padding: 3px 9px; border-color: transparent; background: transparent; font-size: .7rem; }
.code-editor nav button.active { border-color: #d2cec7; background: #fff; }
.code-editor textarea { min-height: 180px; border: 0; border-radius: 0; font: 12px/1.5 ui-monospace, SFMono-Regular, monospace; resize: vertical; }
.const-editor textarea { min-height: 240px; font: 12px/1.5 ui-monospace, SFMono-Regular, monospace; }
.error { margin: 8px 10px 0; padding: 7px 9px; border-radius: 6px; color: #8d2929; background: #fff0f0; font-size: .75rem; }
.empty { display: grid; min-height: 260px; place-items: center; color: #777; }
.editor-tabs { display: flex; gap: 3px; padding: 6px 10px; border-bottom: 1px solid #e4e1db; overflow-x: auto; background: #faf9f6; }
.editor-tabs button { flex: 0 0 auto; min-height: 30px; padding: 4px 10px; border-color: transparent; background: transparent; font-size: .72rem; }
.editor-tabs button.active { border-color: #d7d3cc; background: #fff; font-weight: 750; }
.asset-panel { display: grid; grid-template-columns: minmax(180px, 340px) minmax(180px, 1fr); align-items: start; gap: 14px; padding: 12px; }
.asset-panel img, .asset-panel > .asset-placeholder { width: 100%; aspect-ratio: 4 / 3; height: auto; border-radius: 8px; object-fit: cover; }
.asset-panel strong { display: block; margin-top: 4px; font-size: .84rem; }
.asset-panel p { margin: 5px 0 12px; color: #77736d; font-size: .72rem; }
.const-editor small { color: #77736d; font-size: .66rem; font-weight: 400; }
@media (max-width: 720px) {
  .editor__bar { top: 52px; display: grid; grid-template-columns: 34px minmax(0, 1fr) auto; gap: 6px; min-height: auto; padding: 7px; }
  .editor__bar strong { width: 100%; margin: 0; }
  .editor__bar select { max-width: 104px; }
  .editor__actions { grid-column: 2 / -1; justify-content: flex-end; }
  .editor__actions button { min-width: 72px; }
  .back { display: block; grid-row: 1 / 3; align-self: stretch; padding: 4px; }
  .fields { gap: 7px; padding: 8px; }
  .fields--meta { grid-template-columns: 1fr; }
  .fields--meta label:nth-child(3), .wide { grid-column: auto; }
  .editor-tabs { position: sticky; top: 121px; z-index: 1; padding-inline: 7px; }
  .asset-panel { grid-template-columns: 1fr; gap: 8px; padding: 8px; }
  .asset-panel img, .asset-panel > .asset-placeholder { max-height: 58dvh; }
  .upload { width: 100%; text-align: center; }
  .code-editor, .const-editor { margin: 0 8px 8px; }
  .code-editor textarea { min-height: 220px; }
  .const-editor textarea { min-height: 280px; }
}
</style>
