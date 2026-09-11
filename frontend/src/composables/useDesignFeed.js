import { computed, ref } from 'vue'
import { getBatchSize } from '../domain/galleryPolicy'
import { listDesigns } from '../repositories/designRepository'

export function useDesignFeed() {
  const designs = ref([])
  const total = ref(0)
  const isLoading = ref(false)
  const hasMore = computed(() => designs.value.length < total.value)

  async function loadMore() {
    if (isLoading.value || (total.value > 0 && !hasMore.value)) return

    isLoading.value = true
    try {
      const page = await listDesigns({
        offset: designs.value.length,
        limit: getBatchSize(window.innerWidth),
      })
      designs.value.push(...page.items)
      total.value = page.total
    } finally {
      isLoading.value = false
    }
  }

  return { designs, hasMore, isLoading, loadMore }
}
