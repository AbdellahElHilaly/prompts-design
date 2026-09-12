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
  <div class="data-table" role="table" aria-label="التصاميم">
    <div class="table-head" role="row">
      <span role="columnheader">التصميم</span>
      <span role="columnheader">الوصف</span>
      <span role="columnheader">الحالة</span>
      <span role="columnheader">التقييم</span>
      <span role="columnheader" aria-label="العمليات" />
    </div>

    <article
      v-for="design in designs"
      :key="design.id"
      class="design-row"
      :class="{ 'is-selected': design.id === selectedId }"
      role="row"
    >
      <button class="design-cell" type="button" role="cell" @click="$emit('select', design)">
        <img :src="previewUrl(design.preview)" alt="" width="72" height="54" />
        <span>
          <strong>{{ design.title }}</strong>
          <small>{{ design.id }}</small>
          <em class="mobile-meta">{{ design.status }} · {{ design.approvalRate }}%</em>
          <em class="mobile-description">{{ design.description }}</em>
        </span>
      </button>
      <p class="description-cell" role="cell">{{ design.description }}</p>
      <span role="cell"><i :class="`status status--${design.status}`">{{ design.status }}</i></span>
      <strong class="approval" role="cell">{{ design.approvalRate }}%</strong>
      <details class="row-menu" role="cell">
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
.data-table { min-width: 0; border-top: 1px solid #e2dfd9; }
.table-head, .design-row { display: grid; grid-template-columns: minmax(240px, 1.35fr) minmax(180px, 1fr) 90px 76px 44px; align-items: center; }
.table-head { min-height: 34px; padding-inline: 9px 0; border-bottom: 1px solid #ddd9d2; color: #77736d; background: #f5f3ef; font-size: .65rem; font-weight: 750; }
.design-row { position: relative; min-width: 0; min-height: 70px; padding-inline-start: 9px; border-bottom: 1px solid #e7e4de; background: #fff; }
.design-row:hover, .design-row.is-selected { background: #faf9f6; }
.design-row.is-selected { box-shadow: inset -3px 0 #262522; }
.design-cell { display: grid; grid-template-columns: 72px minmax(0, 1fr); align-items: center; gap: 10px; min-width: 0; height: 100%; padding: 8px 0; border: 0; background: transparent; text-align: start; cursor: pointer; }
.design-cell img { width: 72px; height: 54px; border-radius: 6px; object-fit: cover; }
.design-cell span { min-width: 0; }
.design-cell strong, .design-cell small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.design-cell strong { font-size: .82rem; }
.design-cell small { margin-top: 4px; color: #8a867f; font-size: .62rem; }
.description-cell { display: -webkit-box; margin: 0; padding-inline: 8px; overflow: hidden; color: #625f59; font-size: .69rem; line-height: 1.4; -webkit-box-orient: vertical; -webkit-line-clamp: 2; }
.status { display: inline-block; padding: 3px 6px; border-radius: 4px; color: #776d5e; background: #eee9df; font-size: .6rem; font-style: normal; }
.status--published { color: #28644e; background: #e1f0e9; }
.approval { font-size: .73rem; }
.mobile-meta, .mobile-description { display: none; }
.row-menu { position: relative; display: grid; place-items: center; height: 100%; }
.row-menu summary { display: grid; width: 34px; height: 38px; place-items: center; border-radius: 7px; cursor: pointer; font-size: 1.2rem; list-style: none; }
.row-menu summary::-webkit-details-marker { display: none; }
.row-menu[open] summary { background: #ece9e3; }
.row-menu div { position: absolute; z-index: 12; top: 52px; left: 6px; display: grid; width: 176px; padding: 5px; border: 1px solid #d8d4cd; border-radius: 8px; background: #fff; box-shadow: 0 10px 28px rgb(0 0 0 / .14); }
.row-menu button { min-height: 34px; padding: 5px 8px; border: 0; border-radius: 5px; background: transparent; text-align: start; font: inherit; font-size: .73rem; cursor: pointer; }
.row-menu button:hover { background: #f1efeb; }
.row-menu button.danger { color: #9b3838; }
.empty-list { padding: 28px 12px; color: #77736d; text-align: center; font-size: .78rem; }
@media (max-width: 720px) {
  .table-head { display: none; }
  .design-row { grid-template-columns: minmax(0, 1fr) 40px; min-height: 78px; padding-inline-start: 8px; }
  .design-cell { grid-template-columns: 76px minmax(0, 1fr); gap: 9px; padding: 8px 0; }
  .design-cell img { width: 76px; height: 57px; }
  .description-cell, .design-row > span[role="cell"], .approval { display: none; }
  .mobile-meta, .mobile-description { display: block; overflow: hidden; font-style: normal; text-overflow: ellipsis; white-space: nowrap; }
  .mobile-meta { margin-top: 3px; color: #43715d; font-size: .6rem; }
  .mobile-description { margin-top: 3px; color: #716d66; font-size: .64rem; }
  .row-menu div { position: fixed; right: 12px; bottom: 12px; left: 12px; top: auto; width: auto; padding: 7px; border-radius: 10px; }
  .row-menu button { min-height: 40px; font-size: .8rem; }
}
</style>
