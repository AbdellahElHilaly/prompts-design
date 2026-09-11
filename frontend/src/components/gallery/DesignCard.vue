<script setup>
import { computed } from 'vue'

const props = defineProps({
  design: { type: Object, required: true },
})

defineEmits(['select'])

const previewUrl = computed(
  () => `${import.meta.env.BASE_URL}${props.design.preview}`,
)
</script>

<template>
  <button
    class="design-card"
    type="button"
    :aria-label="`فتح ${design.title}`"
    @click="$emit('select', design)"
  >
    <img
      :src="previewUrl"
      :alt="design.title"
      width="724"
      height="543"
      loading="lazy"
      decoding="async"
    />
  </button>
</template>

<style scoped>
.design-card {
  width: 100%;
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: var(--radius);
  background: #e8e5df;
  box-shadow: 0 2px 10px rgb(15 18 23 / 6%);
  cursor: pointer;
  aspect-ratio: 4 / 3;
  transition: transform 180ms ease, box-shadow 180ms ease;
}

.design-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 240ms ease;
}

@media (hover: hover) {
  .design-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 16px 36px rgb(15 18 23 / 13%);
  }

  .design-card:hover img { transform: scale(1.015); }
}
</style>
