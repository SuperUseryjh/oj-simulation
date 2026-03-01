<script setup lang="ts">
import { useGame } from '../composables/useGame'

const { game, convertAP, addProblem, organizeContest, fundraising } = useGame()
</script>

<template>
  <div class="action-card">
    <h3>📢 资源转化 (每次 10 行动力)</h3>
    <button @click="convertAP('rd')">转研发 (+10)</button>
    <button @click="convertAP('acad')">转学术 (+10)</button>
    <button @click="convertAP('comm')">转社区 (+10)</button>
    <button @click="fundraising" style="float: right; background: #5d4037">
      号召募捐 (50 行动力, 降声誉)
    </button>
    <div style="clear: both; margin-top: 5px; font-size: 0.8em; color: #aaa">
      募捐获得金钱数: 用户数 × (声誉+1) × 5
    </div>
  </div>

  <div class="action-card">
    <h3>🏆 赛事运营</h3>
    <div class="card-desc">举办比赛可提升下月用户增长速度。</div>
    <button @click="organizeContest('old')">
      原题赛 (需要$500, 学术40)<br />
      <span style="font-size: 0.8em">普通题目+4, 增长x1.05</span>
    </button>
    <button @click="organizeContest('water')">
      水赛 (需要$1000, 学术40)<br />
      <span style="font-size: 0.8em">低质题目+6, 增长x1.15</span>
    </button>
    <button @click="organizeContest('normal')">
      普通赛 (需要$3000, 学术80)<br />
      <span style="font-size: 0.8em">普通题目+4, 增长x1.1</span>
    </button>
    <button @click="organizeContest('grand')">
      优秀赛 (需要$8000, 学术200)<br />
      <span style="font-size: 0.8em">高质题目+3, 增长x1.1, 升声誉</span>
    </button>
  </div>

  <div class="action-card">
    <h3>📝 题库扩充</h3>
    <div class="card-desc" style="font-size: 0.85em; color: #aaa; margin-bottom: 5px">
      搬运普通/低质试题可吸引 10~50 名新用户。
    </div>
    <button @click="addProblem('high')">高质量 (+3题, -20学术)</button>
    <button @click="addProblem('mid')">普通 (+10题, -20学术)</button>
    <button @click="addProblem('low')">低质量 (+20题, -20学术)</button>
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

.card-desc {
  margin-bottom: 10px;
  color: #ccc;
}
</style>
