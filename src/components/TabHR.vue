<script setup lang="ts">
import { computed } from 'vue'
import { useGame } from '../composables/useGame'
import { GAME_PARAMS } from '../constants/game'

const { game, hire } = useGame()

const rdOutput = computed(() => {
  const h = GAME_PARAMS.HIRING
  return (
    (game.staff.rd_student ?? 0) * (h.rd_student?.gain ?? 0) +
    (game.staff.rd_uni ?? 0) * (h.rd_uni?.gain ?? 0) +
    (game.staff.rd_full ?? 0) * (h.rd_full?.gain ?? 0)
  )
})

const acadOutput = computed(() => {
  const h = GAME_PARAMS.HIRING
  return (
    (game.staff.acad_part ?? 0) * (h.acad_part?.gain ?? 0) +
    (game.staff.acad_full ?? 0) * (h.acad_full?.gain ?? 0)
  )
})

const commOutput = computed(() => {
  const h = GAME_PARAMS.HIRING
  return (
    (game.staff.comm_part ?? 0) * (h.comm_part?.gain ?? 0) +
    (game.staff.comm_full ?? 0) * (h.comm_full?.gain ?? 0)
  )
})
</script>

<template>
  <div class="action-card">
    <h3>招聘市场 (消耗 10 AP，兼职人数有上限！)</h3>
    <h4 style="margin-top: 0">研发团队 (产出: {{ rdOutput }}/月)</h4>
    <button @click="hire('rd_student')">高中生 ($1500, +20 研发)</button>
    <button @click="hire('rd_uni')">大学生 ($5000, +75 研发)</button>
    <button @click="hire('rd_full')">全职大牛 ($12000, +120 研发)</button>

    <h4 style="margin-top: 10px">学术团队 (产出: {{ acadOutput }}/月)</h4>
    <button @click="hire('acad_part')">现役选手 ($500, +50 学术)</button>
    <button @click="hire('acad_full')">全职教练 ($15000, +400 学术)</button>

    <h4 style="margin-top: 10px">社区团队 (产出: {{ commOutput }}/月)</h4>
    <button @click="hire('comm_part')">兼职版主 ($500, +50 社区)</button>
    <button @click="hire('comm_full')">全职运营 ($7500, +400 社区)</button>
  </div>
</template>

<style scoped>
.action-card {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 8px;
}

:root {
  --panel-bg: #16213e;
  --border: #333;
}

h3 {
  margin: 0 0 8px 0;
  color: var(--text);
  font-size: 1.1em;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

:root {
  --text: #e94560;
}

h4 {
  margin: 10px 0 5px 0;
  color: #ccc;
  font-size: 0.95em;
}

button {
  background-color: var(--accent);
  color: white;
  border: 1px solid #444;
  padding: 6px 10px;
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
  margin: 2px;
  font-size: 0.9em;
}

:root {
  --accent: #0f3460;
}

button:hover {
  background-color: var(--text);
  transform: translateY(-1px);
}

:root {
  --text: #e94560;
}

button:disabled {
  background-color: #333;
  cursor: not-allowed;
  opacity: 0.6;
  transform: none;
}
</style>
