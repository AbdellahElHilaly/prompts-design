<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { composeDemoDocument } from '../domain/demoDocument'
import { getDesignDemo } from '../repositories/designRepository'

const route = useRoute()
const documentSource = ref('')
const status = ref('loading')

watch(
  () => route.params.designId,
  async (designId) => {
    status.value = 'loading'
    try {
      const demo = await getDesignDemo(designId)
      documentSource.value = composeDemoDocument(demo)
      status.value = 'ready'
    } catch {
      status.value = 'error'
    }
  },
  { immediate: true },
)
</script>

<template>
  <main class="demo-page">
    <iframe
      v-if="status === 'ready'"
      :srcdoc="documentSource"
      title="Live design demo"
      sandbox="allow-scripts allow-forms allow-modals"
      referrerpolicy="no-referrer"
    />
    <p v-else-if="status === 'error'">تعذر تحميل هذا التصميم.</p>
    <p v-else>جاري تشغيل التصميم…</p>
  </main>
</template>

<style scoped>
.demo-page {
  display: grid;
  width: 100%;
  height: 100dvh;
  place-items: center;
  overflow: hidden;
  background: #f5f3ef;
}

.demo-page iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

.demo-page p {
  color: #666;
  font-family: system-ui, sans-serif;
}
</style>
