<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DesignDetailsDialog from '../components/gallery/DesignDetailsDialog.vue'
import DesignGallery from '../components/gallery/DesignGallery.vue'
import { useDesignFeed } from '../composables/useDesignFeed'

const selectedDesign = ref(null)
const loadTrigger = ref(null)
const { designs, hasMore, isLoading, loadMore } = useDesignFeed()
let observer

onMounted(async () => {
  await loadMore()
  observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting && hasMore.value) loadMore()
    },
    { rootMargin: '500px' },
  )
  observer.observe(loadTrigger.value)
})

onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <main class="gallery-page">
    <h1 class="sr-only">Prompt Design</h1>
    <DesignGallery :designs="designs" @select="selectedDesign = $event" />

    <div ref="loadTrigger" class="load-trigger" aria-live="polite">
      <span v-if="isLoading">جاري تحميل التصاميم…</span>
    </div>

    <DesignDetailsDialog :design="selectedDesign" @close="selectedDesign = null" />
  </main>
</template>

<style scoped>
.gallery-page {
  width: 100%;
  min-height: 100dvh;
  padding: var(--page-padding);
}

.load-trigger {
  display: grid;
  min-height: 72px;
  place-items: center;
  color: #777;
  font-size: 0.9rem;
}
</style>
