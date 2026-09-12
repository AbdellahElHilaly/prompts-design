<script setup>
defineProps({
  open: { type: Boolean, default: false },
  hasSelection: { type: Boolean, default: false },
})

defineEmits(['close', 'action'])

const designActions = [
  { id: 'create', icon: '+', label: 'إضافة تصميم' },
  { id: 'info', icon: '✎', label: 'تعديل المعلومات', needsSelection: true },
  { id: 'image', icon: '▣', label: 'تغيير الصورة', needsSelection: true },
  { id: 'demo', icon: '</>', label: 'كود Live demo', needsSelection: true },
  { id: 'live-demo', icon: '▶', label: 'معاينة Live demo', needsSelection: true },
  { id: 'prompt', icon: '{}', label: 'برومبت التصميم', needsSelection: true },
  { id: 'copy-prompt', icon: '▤', label: 'نسخ البرومبت', needsSelection: true },
  { id: 'duplicate', icon: '⧉', label: 'نسخ التصميم', needsSelection: true },
  { id: 'copy-json', icon: '⌘', label: 'نسخ JSON', needsSelection: true },
  { id: 'delete', icon: '×', label: 'حذف التصميم', needsSelection: true, danger: true },
]
</script>

<template>
  <div v-if="open" class="sidebar-backdrop" @click="$emit('close')" />
  <aside class="sidebar" :class="{ open }" aria-label="عمليات لوحة الإدارة">
    <header>
      <div>
        <strong>Prompt Design</strong>
        <small>لوحة الإدارة المحلية</small>
      </div>
      <button type="button" aria-label="إغلاق القائمة" @click="$emit('close')">×</button>
    </header>

    <nav>
      <p>التصاميم</p>
      <button type="button" @click="$emit('action', 'list')"><i>☷</i><span>كل التصاميم</span></button>
      <button
        v-for="action in designActions"
        :key="action.id"
        type="button"
        :class="{ danger: action.danger, primary: action.id === 'create' }"
        :disabled="action.needsSelection && !hasSelection"
        @click="$emit('action', action.id)"
      >
        <i>{{ action.icon }}</i><span>{{ action.label }}</span>
      </button>

      <p>الإعدادات</p>
      <button type="button" @click="$emit('action', 'contract')"><i>§</i><span>عقد البرومبت</span></button>
      <button type="button" @click="$emit('action', 'reset')"><i>↻</i><span>استعادة بيانات JSON</span></button>
    </nav>

    <footer>Static frontend · محفوظ على هذا الجهاز</footer>
  </aside>
</template>

<style scoped>
.sidebar { grid-area: sidebar; display: flex; min-width: 0; flex-direction: column; border-inline-end: 1px solid #ddd9d2; color: #292825; background: #f8f7f4; }
.sidebar header { display: flex; align-items: center; justify-content: space-between; min-height: 64px; padding: 10px 12px; border-bottom: 1px solid #e0ddd7; }
.sidebar header strong, .sidebar header small { display: block; }
.sidebar header strong { font-size: .9rem; }
.sidebar header small { margin-top: 2px; color: #7a7771; font-size: .65rem; }
.sidebar header button { display: none; width: 34px; height: 34px; border: 1px solid #ddd9d2; border-radius: 7px; background: #fff; font-size: 1.2rem; }
.sidebar nav { display: grid; align-content: start; gap: 3px; padding: 8px; overflow: auto; }
.sidebar nav p { margin: 9px 7px 3px; color: #8a867f; font-size: .62rem; font-weight: 800; letter-spacing: .04em; }
.sidebar nav button { display: grid; grid-template-columns: 30px 1fr; align-items: center; min-height: 38px; padding: 5px 7px; border: 0; border-radius: 7px; color: inherit; background: transparent; text-align: start; font: inherit; font-size: .8rem; cursor: pointer; }
.sidebar nav button:hover { background: #ece9e3; }
.sidebar nav button.primary { color: #fff; background: #252421; font-weight: 750; }
.sidebar nav button.danger { color: #9b3838; }
.sidebar nav button:disabled { opacity: .38; cursor: not-allowed; }
.sidebar nav i { display: grid; width: 26px; height: 26px; place-items: center; font: 700 .72rem/1 ui-monospace, monospace; }
.sidebar footer { margin-top: auto; padding: 10px 12px; border-top: 1px solid #e0ddd7; color: #85817a; font-size: .62rem; }
.sidebar-backdrop { display: none; }
@media (max-width: 800px) {
  .sidebar { position: fixed; z-index: 30; top: 0; right: 0; bottom: 0; width: min(82vw, 288px); transform: translateX(105%); box-shadow: -12px 0 34px rgb(0 0 0 / .16); transition: transform .2s ease; }
  .sidebar.open { transform: translateX(0); }
  .sidebar header button { display: block; }
  .sidebar-backdrop { position: fixed; z-index: 29; inset: 0; display: block; background: rgb(20 19 18 / .34); }
}
</style>
