<script setup lang="ts">
const steps = [
  ["01", "baseline", "fixtures already committed"],
  ["02", "begin", "one transaction for the test"],
  ["03", "exercise", "real queries + real authorization"],
  ["04", "rollback", "every write disappears"],
] as const;
</script>

<template>
  <figure class="transaction-sketch" aria-labelledby="transaction-sketch-title">
    <figcaption>
      <span>Trace 001</span>
      <strong id="transaction-sketch-title">One test, start to finish.</strong>
    </figcaption>
    <ol>
      <li v-for="([number, command, note], index) in steps" :key="command">
        <span class="trace-number">{{ number }}</span>
        <code>{{ command }}</code>
        <span>{{ note }}</span>
        <i v-if="index < steps.length - 1" aria-hidden="true">↓</i>
      </li>
    </ol>
    <p class="trace-result"><span aria-hidden="true">✓</span> database restored</p>
  </figure>
</template>
