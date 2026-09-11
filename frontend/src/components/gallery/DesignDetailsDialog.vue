<script setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  design: { type: Object, default: null },
})

const emit = defineEmits(['close'])
const router = useRouter()
const dialog = ref(null)
const copyLabel = ref('نسخ البرومبت')
const previewUrl = computed(() =>
  props.design ? `${import.meta.env.BASE_URL}${props.design.preview}` : '',
)

watch(
  () => props.design,
  async (design) => {
    await nextTick()
    if (design && dialog.value && !dialog.value.open) dialog.value.showModal()
    if (!design && dialog.value?.open) dialog.value.close()
    copyLabel.value = 'نسخ البرومبت'
  },
)

async function copyPrompt() {
  if (!props.design) return

  try {
    await navigator.clipboard.writeText(props.design.prompt)
    copyLabel.value = 'تم النسخ'
  } catch {
    copyLabel.value = 'تعذر النسخ'
  }
}

function openDemo() {
  if (!props.design) return
  const url = router.resolve({
    name: 'demo',
    params: { designId: props.design.id },
  }).href
  window.open(url, '_blank', 'noopener,noreferrer')
}

function close() {
  dialog.value?.close()
}

function closeFromBackdrop(event) {
  if (event.target === dialog.value) close()
}
</script>

<template>
  <dialog
    ref="dialog"
    class="details"
    dir="rtl"
    aria-labelledby="details-title"
    @close="emit('close')"
    @click="closeFromBackdrop"
  >
    <article v-if="design" class="details__panel">
      <button class="details__close" type="button" aria-label="إغلاق" @click="close">×</button>
      <div class="details__media">
        <img class="details__preview" :src="previewUrl" :alt="design.title" />
      </div>
      <div class="details__content">
        <div class="details__heading">
          <h2 id="details-title">{{ design.title }}</h2>
          <span aria-label="التقييم">★ {{ design.rating }}</span>
        </div>
        <p>{{ design.description }}</p>
        <div class="details__actions">
          <button class="details__demo" type="button" @click="openDemo">Live demo</button>
          <button class="details__copy" type="button" @click="copyPrompt">{{ copyLabel }}</button>
        </div>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.details {
  width: min(1120px, calc(100% - 20px), calc(200dvh - 40px));
  max-width: none;
  max-height: calc(100dvh - 20px);
  padding: 0;
  overflow: hidden;
  border: 0;
  border-radius: 28px;
  background: #fff;
  box-shadow: 0 30px 100px rgb(0 0 0 / 28%);
}

.details::backdrop {
  background: rgb(9 10 13 / 72%);
  backdrop-filter: blur(12px);
}

.details__panel {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(250px, 1fr);
  min-height: 0;
}

.details__media {
  min-width: 0;
  min-height: 0;
  overflow: hidden;
  aspect-ratio: 4 / 3;
}

.details__preview {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.details__content {
  display: flex;
  min-height: 0;
  flex-direction: column;
  overflow-y: auto;
  padding: clamp(28px, 4vw, 56px);
}

.details__heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
}

.details__heading h2 {
  margin: 0;
  font-size: clamp(1.65rem, 3vw, 2.6rem);
  line-height: 1.15;
}

.details__heading span {
  flex: 0 0 auto;
  color: #8c6513;
  font-weight: 750;
}

.details__content p {
  margin: 20px 0 36px;
  color: #656565;
  font-size: 1.03rem;
  line-height: 1.8;
}

.details__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: auto;
}

.details__actions button {
  padding: 15px 16px;
  border-radius: 15px;
  font-weight: 750;
  cursor: pointer;
}

.details__demo {
  border: 1px solid #d8d4ce;
  background: #fff;
}

.details__copy {
  border: 0;
  color: #fff;
  background: #171717;
}

.details__close {
  position: absolute;
  z-index: 1;
  top: 14px;
  left: 14px;
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  padding: 0 0 4px;
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 88%);
  font-size: 1.8rem;
  cursor: pointer;
  backdrop-filter: blur(10px);
}

@media (max-width: 760px) {
  .details {
    width: 100%;
    max-height: 100dvh;
    margin: 0;
    overflow-y: auto;
    border-radius: 0;
  }

  .details__panel {
    display: block;
  }

  .details__media {
    width: 100%;
    aspect-ratio: 4 / 3;
  }

  .details__content {
    min-height: 300px;
    overflow: visible;
    padding: 24px 20px;
  }
}
</style>
