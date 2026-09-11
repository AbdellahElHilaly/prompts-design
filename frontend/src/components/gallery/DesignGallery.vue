<script setup>
import DesignCard from './DesignCard.vue'

defineProps({
  designs: { type: Array, required: true },
})

defineEmits(['select'])
</script>

<template>
  <section class="gallery" aria-label="معرض التصاميم">
    <DesignCard
      v-for="design in designs"
      :key="design.id"
      :design="design"
      @select="$emit('select', $event)"
    />
  </section>
</template>

<style scoped>
.gallery {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: clamp(10px, 1.3vw, 22px);
}

@media (min-width: 700px) {
  .gallery { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}

@media (min-width: 1100px) {
  .gallery { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}

@media (min-width: 1700px) {
  .gallery { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}

@media (min-width: 2500px) {
  .gallery { grid-template-columns: repeat(8, minmax(0, 1fr)); }
}
</style>
