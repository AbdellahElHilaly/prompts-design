<script setup>
defineProps({
  designs: { type: Array, required: true },
  selectedId: { type: String, default: '' },
})

defineEmits(['select', 'action'])

const actions = [
  { id: 'info', label: 'تعديل المعلومات' },
  { id: 'image', label: 'تغيير الصورة' },
  { id: 'demo', label: 'تعديل كود Demo' },
  { id: 'live-demo', label: 'فتح Live demo' },
  { id: 'prompt', label: 'تعديل البرومبت' },
  { id: 'copy-prompt', label: 'نسخ البرومبت' },
  { id: 'duplicate', label: 'إنشاء نسخة' },
  { id: 'copy-json', label: 'نسخ JSON' },
  { id: 'delete', label: 'حذف', danger: true },
]

function previewUrl(preview) {
  return preview.startsWith('data:') ? preview : `${import.meta.env.BASE_URL}${preview}`
}
</script>

<template>
  <div class="design-list">
    <article
      v-for="design in designs"
      :key="design.id"
      class="design-row"
      :class="{ 'is-selected': design.id === selectedId }"
    >
      <button class="design-row__main" type="button" @click="$emit('select', design)">
        <img :src="previewUrl(design.preview)" alt="" width="80" height="60" />
        <span class="design-row__content">
          <span class="design-row__title">
            <strong>{{ design.title }}</strong>
            <i :class="`status status--${design.status}`">{{ design.status }}</i>
          </span>
          <small>{{ design.description }}</small>
          <em>{{ design.id }} · {{ design.approvalRate }}%</em>
        </span>
      </button>
      <details class="row-menu">
        <summary aria-label="عمليات التصميم">⋮</summary>
        <div>
          <button
            v-for="action in actions"
            :key="action.id"
            type="button"
            :class="{ danger: action.danger }"
            @click="$emit('action', { design, action: action.id }); $event.currentTarget.closest('details').removeAttribute('open')"
          >
            {{ action.label }}
          </button>
        </div>
      </details>
    </article>
    <p v-if="!designs.length" class="empty-list">لا توجد تصاميم مطابقة.</p>
  </div>
</template>

<style scoped>
.design-list { display: grid; align-content: start; border-top: 1px solid #e7e4de; }
.design-row { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 42px; align-items: stretch; min-width: 0; border-bottom: 1px solid #e7e4de; background: #fff; }
.design-row:hover, .design-row.is-selected { background: #f8f7f4; }
.design-row.is-selected { box-shadow: inset -3px 0 #262522; }
.design-row__main { display: grid; grid-template-columns: 80px minmax(0, 1fr); align-items: center; gap: 11px; min-width: 0; padding: 9px 10px; border: 0; background: transparent; text-align: start; cursor: pointer; }
.design-row img { width: 80px; height: 60px; border-radius: 6px; object-fit: cover; }
.design-row__content { display: block; min-width: 0; }
.design-row__title { display: flex; align-items: center; gap: 7px; min-width: 0; }
.design-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .88rem; }
.design-row small { display: -webkit-box; margin-top: 4px; overflow: hidden; color: #65625d; font-size: .72rem; line-height: 1.35; -webkit-box-orient: vertical; -webkit-line-clamp: 1; }
.design-row em { display: block; margin-top: 4px; overflow: hidden; color: #918d86; font-size: .63rem; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
.status { flex: 0 0 auto; padding: 2px 5px; border-radius: 4px; color: #776d5e; background: #eee9df; font-size: .58rem; font-style: normal; font-weight: 650; }
.status--published { color: #28644e; background: #e1f0e9; }
.row-menu { position: relative; display: grid; place-items: center; }
.row-menu summary { display: grid; width: 34px; height: 38px; place-items: center; border-radius: 7px; cursor: pointer; font-size: 1.2rem; list-style: none; }
.row-menu summary::-webkit-details-marker { display: none; }
.row-menu[open] summary { background: #ece9e3; }
.row-menu div { position: absolute; z-index: 12; top: 44px; left: 6px; display: grid; width: 170px; padding: 5px; border: 1px solid #d8d4cd; border-radius: 8px; background: #fff; box-shadow: 0 10px 28px rgb(0 0 0 / .14); }
.row-menu button { min-height: 34px; padding: 5px 8px; border: 0; border-radius: 5px; background: transparent; text-align: start; font: inherit; font-size: .73rem; cursor: pointer; }
.row-menu button:hover { background: #f1efeb; }
.row-menu button.danger { color: #9b3838; }
.empty-list { padding: 28px 12px; color: #77736d; text-align: center; font-size: .78rem; }
@media (max-width: 520px) {
  .design-row { grid-template-columns: minmax(0, 1fr) 40px; }
  .design-row__main { grid-template-columns: 72px minmax(0, 1fr); gap: 9px; padding: 8px; }
  .design-row img { width: 72px; height: 54px; }
  .design-row__title { align-items: flex-start; flex-direction: column; gap: 3px; }
  .design-row strong { width: 100%; }
  .row-menu div { position: fixed; right: 12px; bottom: 12px; left: 12px; top: auto; width: auto; padding: 7px; border-radius: 10px; }
  .row-menu button { min-height: 40px; font-size: .8rem; }
}
</style>
