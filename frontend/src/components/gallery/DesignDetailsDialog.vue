<script setup>
import { computed, nextTick, ref, watch } from 'vue'

const props = defineProps({
  design: { type: Object, default: null },
})

const emit = defineEmits(['close'])
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
      <img class="details__preview" :src="previewUrl" :alt="design.title" />
      <div class="details__content">
        <div class="details__heading">
          <h2 id="details-title">{{ design.title }}</h2>
          <span aria-label="التقييم">★ {{ design.rating }}</span>
        </div>
        <p>{{ design.description }}</p>
        <button class="details__copy" type="button" @click="copyPrompt">
          {{ copyLabel }}
        </button>
      </div>
    </article>
  </dialog>
</template>

<style scoped>
.details {
  width: min(1120px, calc(100% - 20px));
  max-width: none;
  max-height: calc(100dvh - 20px);
  padding: 0;
  overflow: auto;
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
  grid-template-columns: minmax(0, 1.45fr) minmax(280px, 0.75fr);
  min-height: min(700px, calc(100dvh - 20px));
}

.details__preview {
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
}

.details__content {
  display: flex;
  flex-direction: column;
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

.details__copy {
  width: 100%;
  margin-top: auto;
  padding: 15px 20px;
  border: 0;
  border-radius: 15px;
  color: #fff;
  background: #171717;
  font-weight: 750;
  cursor: pointer;
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
    height: 100dvh;
    max-height: none;
    margin: 0;
    border-radius: 0;
  }

  .details__panel {
    grid-template-columns: 1fr;
    min-height: 100%;
  }

  .details__preview {
    height: min(54dvh, 520px);
    min-height: 280px;
  }

  .details__content { min-height: 330px; }
}
</style>
