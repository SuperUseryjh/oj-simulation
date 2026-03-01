<script setup lang="ts">
import { computed } from 'vue'
import { useGame } from '../composables/useGame'
import { GAME_PARAMS } from '../constants/game'

const { game, expandHardware, upgradeArch, unlockFeature } = useGame()

const serverUpgradeCost = computed(() => {
  const level = game.hardware.server_arch
  return `$${10000 * level} + ${100 * level} 研发`
})

const judgeUpgradeCost = computed(() => {
  const level = game.hardware.judge_arch
  return `$${10000 * level} + ${100 * level} 研发`
})
</script>

<template>
  <div class="action-card">
    <h3>💻 基础设施</h3>
    <div style="color: #ff5252; font-size: 0.85em; margin-bottom: 10px; font-weight: bold">
      ⚠️ 注意：当核心数达到架构上限（32或64 × 架构等级）时，必须先升级架构才能继续购买。
    </div>

    <div class="btn-group">
      <label>Web核心:</label>
      <button @click="expandHardware('server', 1)">+1</button>
      <button @click="expandHardware('server', 10)" class="btn-small">+10</button>
      <button @click="expandHardware('server', 'max')" class="btn-small" style="background: #555">
        填满
      </button>
    </div>

    <div class="btn-group">
      <label>评测核心:</label>
      <button @click="expandHardware('judge', 1)">+1</button>
      <button @click="expandHardware('judge', 10)" class="btn-small">+10</button>
      <button @click="expandHardware('judge', 'max')" class="btn-small" style="background: #555">
        填满
      </button>
    </div>

    <div class="btn-group" style="margin-top: 10px">
      <button @click="expandHardware('disk', 1)">加硬盘 (+40GB)</button>
      <button @click="expandHardware('disk', 25)">加硬盘 (+1000GB)</button>
    </div>
  </div>

  <div class="action-card">
    <h3>🚀 功能研发</h3>
    <div id="rd-list">
      <div
        v-for="(feature, key) in GAME_PARAMS.FEATURES"
        :key="key"
        :style="{
          background: '#222',
          padding: '10px',
          marginBottom: '8px',
          borderRadius: '4px',
          borderLeft: `3px solid ${game.features_unlocked[key] ? '#4caf50' : '#ff9800'}`
        }"
      >
        <div style="display: flex; justify-content: space-between; align-items: center">
          <span style="font-weight: bold">{{ feature.name }}</span>
          <button v-if="!game.features_unlocked[key]" @click="unlockFeature(key)">
            研发 (${{ feature.cost }}, 研发点 {{ feature.rd }})
          </button>
          <button v-else disabled>✅ 已完成</button>
        </div>
        <div style="font-size: 0.8em; color: #888; margin-top: 4px">
          {{ feature.desc }} (维护: {{ feature.maintain }}/月)
        </div>
      </div>
    </div>
  </div>

  <div class="action-card">
    <h3>🏗️ 架构升级</h3>
    <div class="card-desc">架构升级后，每个核心可额外容纳 100 活跃用户。</div>
    <div style="font-size: 0.85em; color: #aaa; margin-bottom: 8px; line-height: 1.5">
      Web下级需求: <span id="disp-up-server-cost" style="color: #ffb74d">{{ serverUpgradeCost }}</span
      ><br />
      评测下级需求: <span id="disp-up-judge-cost" style="color: #ffb74d">{{ judgeUpgradeCost }}</span>
    </div>
    <button @click="upgradeArch('server')">Web架构升级</button>
    <button @click="upgradeArch('judge')">评测架构升级</button>
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

.btn-group {
  display: flex;
  align-items: center;
  margin-bottom: 6px;
}

.btn-group label {
  width: 80px;
  font-size: 0.9em;
  color: #ccc;
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

.btn-small {
  padding: 4px 8px;
  font-size: 0.8em;
  background-color: #444;
}

.card-desc {
  margin-bottom: 10px;
  color: #ccc;
}

#rd-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
</style>
