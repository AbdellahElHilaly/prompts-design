<script setup>
defineProps({
  designs: { type: Array, required: true },
  selectedId: { type: String, default: '' },
})

defineEmits(['select'])

function previewUrl(preview) {
  return preview.startsWith('data:') ? preview : `${import.meta.env.BASE_URL}${preview}`
}
</script>

<template>
  <div class="design-list">
    <button
      v-for="design in designs"
      :key="design.id"
      class="design-row"
      :class="{ 'is-selected': design.id === selectedId }"
      type="button"
      @click="$emit('select', design)"
    >
      <img :src="previewUrl(design.preview)" alt="" width="64" height="48" />
      <span>
        <strong>{{ design.title }}</strong>
        <small>{{ design.id }}</small>
      </span>
      <i :class="`status status--${design.status}`">{{ design.status }}</i>
    </button>
  </div>
</template>

<style scoped>
.design-list { display: grid; align-content: start; }
.design-row { display: grid; grid-template-columns: 64px minmax(0, 1fr) auto; align-items: center; gap: 10px; width: 100%; padding: 8px; border: 0; border-bottom: 1px solid #e8e5df; background: transparent; text-align: start; cursor: pointer; }
.design-row:hover, .design-row.is-selected { background: #f0eee9; }
.design-row.is-selected { box-shadow: inset 3px 0 #171717; }
.design-row img { width: 64px; height: 48px; border-radius: 7px; object-fit: cover; }
.design-row span { min-width: 0; }
.design-row strong, .design-row small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.design-row strong { font-size: .86rem; }
.design-row small { margin-top: 3px; color: #777; font-size: .72rem; }
.status { padding: 3px 6px; border-radius: 5px; color: #776d5e; background: #eee9df; font-size: .65rem; font-style: normal; }
.status--published { color: #28644e; background: #e1f0e9; }
</style>
