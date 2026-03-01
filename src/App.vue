<script setup lang="ts">
import { onMounted, nextTick, ref } from 'vue'
import { useGame } from './composables/useGame'
import GameSidebar from './components/GameSidebar.vue'
import TabOperations from './components/TabOperations.vue'
import TabRD from './components/TabRD.vue'
import TabHR from './components/TabHR.vue'
import TabEdu from './components/TabEdu.vue'

const { game, logs, activeTab, gameOver, init, nextMonth, switchTab, isBankruptWarning } =
  useGame()

const logArea = ref<HTMLElement | null>(null)

onMounted(() => {
  init()
})

const scrollToBottom = async () => {
  await nextTick()
  if (logArea.value) {
    logArea.value.scrollTop = logArea.value.scrollHeight
  }
}

const handleNextMonth = () => {
  nextMonth()
  scrollToBottom()
}

const getLogClass = (type: string) => {
  switch (type) {
    case 'good':
      return 'log-good'
    case 'bad':
      return 'log-bad'
    case 'warn':
      return 'log-warn'
    default:
      return ''
  }
}
</script>

<template>
  <div class="app-container">
    <GameSidebar />

    <div id="main">
      <div
        id="warning-banner"
        v-if="isBankruptWarning"
        style="display: block"
      >
        ⚠️ 警告：预计下个月将破产！请立即筹集资金！
      </div>

      <button id="next-month-btn" @click="handleNextMonth" :disabled="gameOver">
        进入下个月
      </button>

      <div class="tabs">
        <div
          class="tab"
          :class="{ active: activeTab === 'ops' }"
          @click="switchTab('ops')"
        >
          日常运营
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'rd' }"
          @click="switchTab('rd')"
        >
          研发中心
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'hr' }"
          @click="switchTab('hr')"
        >
          人才招募
        </div>
        <div
          class="tab"
          :class="{ active: activeTab === 'edu' }"
          @click="switchTab('edu')"
        >
          网校课程
        </div>
      </div>

      <div id="tab-ops" class="panel" :class="{ active: activeTab === 'ops' }">
        <TabOperations />
      </div>

      <div id="tab-rd" class="panel" :class="{ active: activeTab === 'rd' }">
        <TabRD />
      </div>

      <div id="tab-hr" class="panel" :class="{ active: activeTab === 'hr' }">
        <TabHR />
      </div>

      <div id="tab-edu" class="panel" :class="{ active: activeTab === 'edu' }">
        <TabEdu />
      </div>

      <div id="log-area" ref="logArea">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-entry"
          :class="getLogClass(log.type)"
        >
          [{{ log.date }}] {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<style>
:root {
  --bg-color: #1a1a2e;
  --panel-bg: #16213e;
  --accent: #0f3460;
  --text: #e94560;
  --text-light: #f1f1f1;
  --success: #4caf50;
  --warning: #ff9800;
  --danger: #f44336;
  --border: #333;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  background-color: var(--bg-color);
  color: var(--text-light);
  margin: 0;
  height: 100vh;
  overflow: hidden;
}

#app {
  height: 100vh;
}

.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

#main {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow-y: auto;
}

#warning-banner {
  background-color: rgba(244, 67, 54, 0.2);
  border: 1px solid #f44336;
  color: #ff8a80;
  padding: 15px;
  margin-bottom: 15px;
  border-radius: 6px;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.8;
  }
}

#next-month-btn {
  width: 100%;
  padding: 15px;
  font-size: 1.2em;
  font-weight: bold;
  background-color: var(--success);
  border: none;
  margin-bottom: 10px;
  border-radius: 8px;
  color: white;
  cursor: pointer;
  transition: background-color 0.2s;
}

#next-month-btn:hover {
  background-color: #43a047;
}

#next-month-btn:disabled {
  background-color: #333;
  cursor: not-allowed;
}

.tabs {
  display: flex;
  border-bottom: 2px solid #333;
  margin-bottom: 15px;
}

.tab {
  padding: 10px 20px;
  cursor: pointer;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px 8px 0 0;
  margin-right: 4px;
  transition: background-color 0.2s;
}

.tab:hover {
  background: rgba(255, 255, 255, 0.1);
}

.tab.active {
  background: var(--text);
  color: white;
  font-weight: bold;
}

.panel {
  display: none;
  animation: fadeIn 0.3s;
}

.panel.active {
  display: block;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#log-area {
  height: 200px;
  background: #111;
  font-family: 'Consolas', monospace;
  padding: 12px;
  overflow-y: auto;
  border: 1px solid #333;
  margin-top: auto;
  color: #ccc;
  font-size: 0.85em;
  border-radius: 6px;
}

.log-entry {
  margin-bottom: 4px;
  border-bottom: 1px solid #222;
  padding-bottom: 2px;
}

.log-bad {
  color: #ff5252;
}

.log-good {
  color: #69f0ae;
}

.log-warn {
  color: #ffd740;
}

::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-color);
}

::-webkit-scrollbar-thumb {
  background: #444;
  border-radius: 4px;
}
</style>
