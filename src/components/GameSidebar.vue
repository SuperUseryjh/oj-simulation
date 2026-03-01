<script setup lang="ts">
import { computed } from 'vue'
import { useGame } from '../composables/useGame'

const { game, forecast, loadInfo, diskInfo } = useGame()

const totalUsers = computed(() => {
  return game.stats.users.normal + game.stats.users.active + game.stats.users.core
})

const totalProblems = computed(() => {
  return game.stats.problems.high + game.stats.problems.mid + game.stats.problems.low
})

const diskUsedGB = computed(() => {
  return (diskInfo.value.used / 1024).toFixed(1)
})

const diskCapGB = computed(() => {
  return (diskInfo.value.cap / 1024).toFixed(1)
})

const repBarWidth = computed(() => {
  return Math.max(0, Math.min(100, ((game.stats.reputation + 1) / 2) * 100)) + '%'
})

const failMonthsColor = computed(() => {
  return game.stats.consecutive_failure_months > 0 ? '#ff5252' : '#aaa'
})
</script>

<template>
  <div id="sidebar">
    <div class="stat-box" style="background: var(--accent); text-align: center">
      <h2 style="border: none; margin: 0; color: #fff">OJ 运维模拟器</h2>
      <div style="font-size: 0.8em; opacity: 0.7">目标: 存活至 2026-01</div>
    </div>

    <div class="stat-box">
      <div class="stat-row">
        <span>📅 日期</span>
        <span id="disp-date" class="stat-val">{{ game.date.year }}-{{ String(game.date.month).padStart(2, '0') }}</span>
      </div>
      <div class="stat-row">
        <span>💰 资金</span>
        <span id="disp-money" class="stat-val">{{ game.money }}</span>
      </div>
      <div class="stat-row">
        <span>⭐ 声誉</span>
        <span id="disp-rep" class="stat-val">{{ game.stats.reputation.toFixed(3) }}</span>
      </div>
      <div class="progress-container">
        <div id="rep-bar" class="progress-bar" :style="{ width: repBarWidth }"></div>
      </div>
    </div>

    <div class="stat-box" style="border: 1px solid #555">
      <div class="stat-row">
        <span>⚠️ 连续故障月数</span>
        <span id="disp-fail-months" :style="{ color: failMonthsColor, fontWeight: 'bold' }">
          {{ game.stats.consecutive_failure_months }} / 6
        </span>
      </div>
      <div style="font-size: 0.75em; color: #888">
        若连续6个月硬盘满或服务器/评测机过载，游戏强制结束。
      </div>
    </div>

    <h3>🔮 下月预测</h3>
    <div class="stat-box">
      <div class="forecast-row">
        <span>预计收入(低保+API)</span>
        <span id="fc-income" class="forecast-val income">+{{ forecast.income }}</span>
      </div>
      <div class="forecast-row">
        <span>预计工资支出</span>
        <span id="fc-salary" class="forecast-val expense">-{{ forecast.salary }}</span>
      </div>
      <div class="forecast-row">
        <span>预计维护支出</span>
        <span id="fc-maint" class="forecast-val expense">-{{ forecast.hw_cost }}</span>
      </div>
      <div class="stat-row" style="margin-top: 5px; border-top: 1px solid #444; padding-top: 5px">
        <span>预计净收支:</span>
        <span
          id="fc-net"
          class="stat-val"
          :style="{ color: forecast.net >= 0 ? '#69f0ae' : '#ff5252' }"
        >
          {{ forecast.net >= 0 ? '+' : '' }}{{ forecast.net }}
        </span>
      </div>
      <div style="font-size: 0.8em; color: #888; margin-top: 5px">
        研发维护: <span id="fc-rd-cost">{{ Math.floor(forecast.rd_cost) }}</span>/月<br />
        学术需求: <span id="fc-acad-cost">{{ Math.floor(forecast.acad_cost) }}</span>/月<br />
        社区需求: <span id="fc-comm-cost">{{ Math.floor(forecast.comm_cost) }}</span>/月
      </div>
    </div>

    <h3>⚡ 资源池</h3>
    <div class="stat-box">
      <div class="stat-row">
        <span>行动力 (AP)</span>
        <span id="disp-ap" class="stat-val" style="color: #ffca28">{{ game.ap }}</span>
      </div>
      <div class="stat-row">
        <span>研发点</span>
        <span id="disp-rd" class="stat-val">{{ Math.floor(game.resources.rd) }}</span>
      </div>
      <div class="stat-row">
        <span>学术点</span>
        <span id="disp-acad" class="stat-val">{{ Math.floor(game.resources.acad) }}</span>
      </div>
      <div class="stat-row">
        <span>社区点</span>
        <span id="disp-comm" class="stat-val">{{ Math.floor(game.resources.comm) }}</span>
      </div>
    </div>

    <h3>📊 运营数据</h3>
    <div class="stat-box">
      <div class="stat-row">
        <span>总用户</span>
        <span id="disp-users-total" class="stat-val">{{ totalUsers }}</span>
      </div>
      <div class="stat-row">
        <span class="sub-text">上月新增提交</span>
        <span id="disp-last-subs" style="color: #fff">{{ game.stats.last_month.subs }}</span>
      </div>
      <div class="stat-row">
        <span class="sub-text">上月新增题解</span>
        <span id="disp-last-sols" style="color: #fff">{{ game.stats.last_month.sols }}</span>
      </div>
      <hr style="border-color: #444; margin: 8px 0" />
      <div class="stat-row">
        <span>题库 (高/中/低)</span>
        <span>
          <span id="disp-prob-high">{{ game.stats.problems.high }}</span>/
          <span id="disp-prob-mid">{{ game.stats.problems.mid }}</span>/
          <span id="disp-prob-low">{{ game.stats.problems.low }}</span>
        </span>
      </div>
      <div class="stat-row">
        <span class="sub-text">硬盘占用</span>
        <span id="disp-disk">{{ diskUsedGB }} / {{ diskCapGB }} GB</span>
      </div>
    </div>

    <h3>🖥️ 服务器</h3>
    <div class="stat-box">
      <div class="stat-row">
        <span>Web核心</span>
        <span>
          <span id="disp-server-core" class="stat-val">{{ game.hardware.server_cores }}</span> 核
          (Lv.<span id="disp-server-arch">{{ game.hardware.server_arch }}</span>)
        </span>
      </div>
      <div class="stat-row">
        <span>评测核心</span>
        <span>
          <span id="disp-judge-core" class="stat-val">{{ game.hardware.judge_cores }}</span> 核
          (Lv.<span id="disp-judge-arch">{{ game.hardware.judge_arch }}</span>)
        </span>
      </div>
      <div class="stat-row" style="justify-content: flex-end; font-size: 0.8em; color: #888">
        Web负载:
        <span
          id="disp-server-load"
          :style="{ color: loadInfo.is_server_overload ? '#ff5252' : '#888' }"
        >
          {{ loadInfo.load }}
        </span>
        /
        <span id="disp-server-cap">{{ loadInfo.server_cap }}</span>
      </div>
      <div class="stat-row" style="justify-content: flex-end; font-size: 0.8em; color: #888">
        评测负载:
        <span
          id="disp-judge-load"
          :style="{ color: loadInfo.is_judge_overload ? '#ff5252' : '#888' }"
        >
          {{ loadInfo.load }}
        </span>
        /
        <span id="disp-judge-cap">{{ loadInfo.judge_cap }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

#sidebar {
  width: 350px;
  background-color: var(--panel-bg);
  padding: 20px;
  overflow-y: auto;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

h2,
h3 {
  margin: 0 0 8px 0;
  color: var(--text);
  font-size: 1.1em;
  border-bottom: 1px solid #333;
  padding-bottom: 5px;
}

.stat-box {
  background: rgba(0, 0, 0, 0.2);
  padding: 10px;
  border-radius: 6px;
  font-size: 0.9em;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  align-items: center;
}

.stat-val {
  font-weight: bold;
  color: #4fc3f7;
  font-family: monospace;
  font-size: 1.1em;
}

.sub-text {
  font-size: 0.8em;
  color: #888;
}

.forecast-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.85em;
  color: #aaa;
  border-bottom: 1px dashed #333;
  padding: 2px 0;
}

.forecast-val {
  font-family: monospace;
}

.income {
  color: #69f0ae;
}

.expense {
  color: #ff5252;
}

.progress-container {
  width: 100%;
  background-color: #333;
  height: 6px;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background-color: var(--success);
  width: 0%;
  transition: width 0.5s ease-out;
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
