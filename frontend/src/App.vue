<script setup>
const version = 'Vue 3'
</script>

<template>
  <main class="welcome" aria-labelledby="page-title">
    <section class="welcome__content">
      <span class="welcome__badge">{{ version }}</span>
      <h1 id="page-title">Prompt Design</h1>
      <p>التجربة الثانية جاهزة للنشر</p>
      <span class="welcome__status" role="status">
        <span aria-hidden="true"></span>
        التطبيق يعمل بنجاح
      </span>
    </section>
  </main>
</template>
