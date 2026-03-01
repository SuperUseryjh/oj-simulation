<script setup lang="ts">
import { useGame } from '../composables/useGame'
import { GAME_PARAMS } from '../constants/game'

const { game, runClass, upgradeClass } = useGame()

const getRunCostText = (key: string) => {
  const conf = GAME_PARAMS.CLASSES[key]
  if (!conf) return ''
  return `$${conf.req_money} + ${conf.req_acad} 学术`
}

const getUpCostText = (key: string) => {
  const conf = GAME_PARAMS.CLASSES[key]
  const st = game.class_state[key]
  if (!conf || !st) return ''
  const isMax = st.level >= conf.max
  return isMax ? 'MAX' : `$${conf.cost_base * st.level} + ${conf.acad_base * st.level} 学术`
}

const isClassMax = (key: string) => {
  const conf = GAME_PARAMS.CLASSES[key]
  const st = game.class_state[key]
  if (!conf || !st) return true
  return st.level >= conf.max
}

const getClassLevel = (key: string) => {
  const st = game.class_state[key]
  return st?.level ?? 1
}

const getClassCooldown = (key: string) => {
  const st = game.class_state[key]
  return st?.cooldown ?? 0
}

const getIncomeText = (key: string) => {
  const conf = GAME_PARAMS.CLASSES[key]
  const st = game.class_state[key]
  if (!conf || !st) return 0
  return conf.inc_base * st.level
}
</script>

<template>
  <div class="action-card">
    <h3>🏫 网校管理</h3>
    <p style="font-size: 0.85em; color: #aaa">
      研发[网校功能]后解锁。课程升级后带来更多收入，但升级成本也会增加。开课后有 3
      个月冷却期。
    </p>
    <div id="edu-list" v-if="game.features_unlocked.school">
      <div v-for="(classConf, key) in GAME_PARAMS.CLASSES" :key="key" class="edu-card">
        <div class="edu-header">
          <span
            >{{ classConf.name }}
            <span style="color: #ffb74d">Lv.{{ getClassLevel(key) }}</span></span
          >
          <span style="font-size: 0.8em; color: #888">Max: Lv.{{ classConf.max }}</span>
        </div>
        <div class="edu-cost">
          <div>开课成本: {{ getRunCostText(key) }}</div>
          <div>升级成本: {{ getUpCostText(key) }}</div>
        </div>
        <div class="edu-actions">
          <button v-if="getClassCooldown(key) > 0" class="btn-run" disabled>
            冷却 ({{ getClassCooldown(key) }}月)
          </button>
          <button v-else class="btn-run" @click="runClass(key)">
            开课 (+{{ getIncomeText(key) }}元)
          </button>
          <button v-if="isClassMax(key)" class="btn-up" disabled> 已满级 </button>
          <button v-else class="btn-up" @click="upgradeClass(key)">升级</button>
        </div>
      </div>
    </div>
    <div v-else style="color: #888; text-align: center">请先解锁网校功能</div>
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

.edu-card {
  background: #222;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  border-left: 4px solid var(--text);
}

:root {
  --text: #e94560;
}

.edu-header {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  margin-bottom: 8px;
}

.edu-cost {
  font-size: 0.85em;
  color: #aaa;
  margin-bottom: 8px;
  line-height: 1.4;
}

.edu-actions {
  display: flex;
  gap: 8px;
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

.btn-run {
  background-color: #2e7d32;
  flex: 1;
}

.btn-up {
  background-color: #1565c0;
  flex: 1;
}
</style>
