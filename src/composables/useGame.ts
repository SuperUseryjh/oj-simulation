import { ref, computed, reactive } from 'vue'
import type { GameState, LogEntry, TabType } from '../types/game'
import { GAME_PARAMS } from '../constants/game'

export function useGame() {
  const game = reactive<GameState>({
    date: { year: GAME_PARAMS.INITIAL.YEAR, month: GAME_PARAMS.INITIAL.MONTH },
    money: GAME_PARAMS.INITIAL.MONEY,
    ap: GAME_PARAMS.INITIAL.AP,
    resources: { rd: 0, acad: 0, comm: 0 },
    stats: {
      users: { normal: GAME_PARAMS.INITIAL.USERS, active: 0, core: 0 },
      problems: { high: 0, mid: 0, low: 0 },
      total_submissions: 0,
      total_solutions: 0,
      reputation: 0,
      last_month: { subs: 0, sols: 0 },
      consecutive_failure_months: 0,
      comm_fail_months: 0,
      pending_user_bonus: 0
    },
    hardware: {
      server_cores: GAME_PARAMS.INITIAL.SERVER_CORES,
      judge_cores: GAME_PARAMS.INITIAL.JUDGE_CORES,
      disk_extra_blocks: 0,
      disk_used: 0,
      server_arch: 1,
      judge_arch: 1
    },
    staff: {},
    class_state: {},
    features_unlocked: {},
    flags: {
      fundraising_penalty_val: 0,
      temp_rep_penalty: 0,
      contest_growth_mult: 1.0
    }
  })

  const logs = ref<LogEntry[]>([
    { message: '💡 欢迎来到 OJ 运维模拟器！', type: 'normal', date: '2013-01' },
    { message: '请密切关注左侧的【下月预测】面板，避免破产。', type: 'normal', date: '2013-01' }
  ])

  const activeTab = ref<TabType>('ops')
  const gameOver = ref(false)

  const init = () => {
    for (const k in GAME_PARAMS.HIRING) {
      game.staff[k] = 0
    }
    for (const k in GAME_PARAMS.CLASSES) {
      game.class_state[k] = { level: 1, cooldown: 0 }
    }
    for (const k in GAME_PARAMS.FEATURES) {
      game.features_unlocked[k] = false
    }
  }

  const addLog = (message: string, type: LogEntry['type'] = 'normal') => {
    const dateStr = `${game.date.year}-${String(game.date.month).padStart(2, '0')}`
    logs.value.push({ message, type, date: dateStr })
  }

  const calculateReputation = (
    acad_gap: number,
    comm_gap: number,
    server_gap: number,
    judge_gap: number,
    total_prob: number
  ) => {
    const p = game.stats.problems
    const u = game.stats.users

    let r_acad = 0
    if (p.high > 0) r_acad += Math.log10(p.high) / 10
    if (total_prob > 0 && p.high / total_prob > 0.4) r_acad += p.high / total_prob - 0.4
    if (p.low > 0) r_acad -= Math.log10(p.low) / 10
    r_acad = Math.min(0.4, r_acad)

    let r_users =
      (Math.log(Math.max(1, u.normal)) / Math.log(200) +
        Math.log(Math.max(1, u.active)) / Math.log(100) +
        Math.log(Math.max(1, u.core)) / Math.log(50)) /
      40
    r_users = Math.min(0.3, r_users)

    let r_edu = 0
    r_edu += (game.class_state.intro?.level ?? 0) * 0.01
    r_edu += (game.class_state.basic?.level ?? 0) * 0.01
    r_edu += (game.class_state.advanced?.level ?? 0) * 0.02
    r_edu += (game.class_state.sprint?.level ?? 0) * 0.02
    r_edu += (game.class_state.national?.level ?? 0) * 0.02
    r_edu = Math.min(0.3, r_edu)

    let r_stable = 0
    if (acad_gap > 0) r_stable -= Math.log10(acad_gap) / 20
    if (comm_gap > 0) r_stable -= Math.log10(comm_gap) / 20
    if (server_gap > 0) r_stable -= Math.log10(server_gap) / 10
    if (judge_gap > 0) r_stable -= Math.log10(judge_gap) / 10

    r_stable -= game.flags.fundraising_penalty_val
    r_stable -= game.flags.temp_rep_penalty

    let total = r_acad + r_users + r_edu + r_stable
    if (total > 1) total = 1
    game.stats.reputation = total
  }

  const nextMonth = () => {
    game.date.month++
    if (game.date.month > 12) {
      game.date.month = 1
      game.date.year++
    }
    const isFreeEra = game.date.year === 2013 && game.date.month < 7
    addLog(`=== ${game.date.year}年 ${game.date.month}月 ===`, 'warn')

    if (game.date.year >= 2026) {
      endGame()
      return
    }

    game.ap = 100
    let salary = 0
    let gain = { rd: 0, acad: 0, comm: 0 }
    for (const k in game.staff) {
      const count = game.staff[k]!
      const conf = GAME_PARAMS.HIRING[k]
      if (count > 0 && conf) {
        salary += count * conf.cost
        gain[conf.type] += count * conf.gain
      }
    }

    game.money += GAME_PARAMS.INCOME.MONTHLY_GRANT
    game.money -= salary
    game.resources.rd += gain.rd
    game.resources.acad += gain.acad
    game.resources.comm += gain.comm

    if (salary > 0) {
      addLog(`财务: 发放工资 ${salary}, 产出 R:${gain.rd} A:${gain.acad} C:${gain.comm}`)
    }

    let maintain_rd = 0
    for (const k in GAME_PARAMS.FEATURES) {
      if (game.features_unlocked[k]) {
        const feature = GAME_PARAMS.FEATURES[k]
        if (feature) maintain_rd += feature.maintain
      }
    }
    maintain_rd += 20 * (game.hardware.server_arch - 1)
    maintain_rd += 20 * (game.hardware.judge_arch - 1)
    game.resources.rd -= maintain_rd

    let hw_cost = game.hardware.disk_extra_blocks * GAME_PARAMS.COSTS.DISK_BLOCK_RENT
    if (!isFreeEra) {
      hw_cost += game.hardware.server_cores * GAME_PARAMS.COSTS.SERVER_CORE_RENT
      hw_cost += game.hardware.judge_cores * GAME_PARAMS.COSTS.JUDGE_CORE_RENT
    }
    game.money -= hw_cost
    if (hw_cost > 0) addLog(`财务: 硬件租金 ${hw_cost}`)

    let server_arch_bonus = (game.hardware.server_arch - 1) * 100
    let judge_arch_bonus = (game.hardware.judge_arch - 1) * 100

    let server_cap_unit =
      500 -
      (game.features_unlocked.team ? 50 : 0) -
      (game.features_unlocked.api ? 50 : 0) +
      server_arch_bonus
    let judge_cap_unit = 500 + judge_arch_bonus

    let server_cap = game.hardware.server_cores * server_cap_unit
    let judge_cap = game.hardware.judge_cores * judge_cap_unit

    let u = game.stats.users
    let load = u.active + u.normal / 3 + u.core * 3
    if ([7, 8, 9, 10].includes(game.date.month)) load *= 1.3

    if (game.features_unlocked.api) {
      let total_u = u.normal + u.active + u.core
      game.money += Math.floor(total_u * 1.0)
    }

    let rep = game.stats.reputation
    let total_users = u.normal + u.active + u.core

    let pct_rate = (rep * 8 + 4) / 100
    if (pct_rate < 0) pct_rate = 0
    let growth_from_pct = total_users * pct_rate
    let growth_from_fixed = (rep + 1) * 50
    if (growth_from_fixed < 0) growth_from_fixed = 0

    let new_users = Math.floor(growth_from_pct + growth_from_fixed)
    if (game.flags.contest_growth_mult !== 1.0) {
      new_users = Math.floor(new_users * game.flags.contest_growth_mult)
      game.flags.contest_growth_mult = 1.0
    }

    if (game.stats.pending_user_bonus > 0) {
      new_users += game.stats.pending_user_bonus
      addLog(`推广: 试题扩充吸引了额外 ${game.stats.pending_user_bonus} 名用户`)
      game.stats.pending_user_bonus = 0
    }

    u.normal += new_users
    if (new_users > 0) addLog(`用户: 新增 ${new_users} 人`)

    let prob_n2a =
      (rep * GAME_PARAMS.USER_BEHAVIOR.UPGRADE_N_A_MULT +
        GAME_PARAMS.USER_BEHAVIOR.UPGRADE_N_A_BASE) /
      100
    if (game.features_unlocked.difficulty) prob_n2a *= 1.1
    if (game.features_unlocked.solution) prob_n2a *= 1.25
    if (game.features_unlocked.discuss) prob_n2a *= 1.1
    if (game.features_unlocked.team) prob_n2a *= 1.1

    let delta_n2a = Math.floor(u.normal * prob_n2a)
    if (delta_n2a > 0) {
      u.normal -= delta_n2a
      u.active += delta_n2a
    } else {
      let delta_a2n = Math.floor(u.active * Math.abs(prob_n2a))
      u.active -= delta_a2n
      u.normal += delta_a2n
    }

    let prob_a2c = (rep * GAME_PARAMS.USER_BEHAVIOR.UPGRADE_A_C_MULT) / 100
    let delta_a2c = Math.floor(u.active * prob_a2c)
    if (delta_a2c > 0) {
      u.active -= delta_a2c
      u.core += delta_a2c
    }

    u.normal -= Math.ceil(u.normal / 120)
    u.active -= Math.ceil(u.active / 60)
    let core_churn = Math.ceil(u.core / 36)
    u.core -= core_churn
    u.active += core_churn

    let subs =
      u.normal * GAME_PARAMS.USER_BEHAVIOR.SUBMISSIONS.normal +
      u.active * GAME_PARAMS.USER_BEHAVIOR.SUBMISSIONS.active +
      u.core * GAME_PARAMS.USER_BEHAVIOR.SUBMISSIONS.core
    let subs_int = Math.floor(subs)
    game.stats.total_submissions += subs_int
    game.stats.last_month.subs = subs_int

    let sols = 0
    if (game.features_unlocked.solution) {
      sols =
        u.normal * GAME_PARAMS.USER_BEHAVIOR.SOLUTIONS.normal +
        u.active * GAME_PARAMS.USER_BEHAVIOR.SOLUTIONS.active +
        u.core * GAME_PARAMS.USER_BEHAVIOR.SOLUTIONS.core
    }
    let sols_int = Math.floor(sols)
    game.stats.total_solutions += sols_int
    game.stats.last_month.sols = sols_int

    let p = game.stats.problems
    let total_prob = p.high + p.mid + p.low
    let disk =
      total_prob * GAME_PARAMS.DISK_USAGE.PROBLEM +
      total_users * GAME_PARAMS.DISK_USAGE.USER_DATA +
      game.stats.total_submissions * GAME_PARAMS.DISK_USAGE.SUBMISSION +
      game.stats.total_solutions * GAME_PARAMS.DISK_USAGE.SOLUTION
    game.hardware.disk_used = disk

    let disk_cap =
      GAME_PARAMS.INITIAL.DISK_MB +
      game.hardware.disk_extra_blocks * GAME_PARAMS.COSTS.DISK_BLOCK_SIZE_GB * 1024

    let is_disk_full = disk > disk_cap
    let is_server_overload = load > server_cap
    let is_judge_overload = load > judge_cap

    if (is_disk_full) addLog('❌ 硬盘已满！数据写入失败！', 'bad')
    if (is_server_overload) addLog('❌ Web服务器过载！', 'bad')
    if (is_judge_overload) addLog('❌ 评测机过载！', 'bad')

    if (is_disk_full || is_server_overload || is_judge_overload) {
      game.stats.consecutive_failure_months++
      addLog(
        `⚠️ 系统故障！连续故障月数: ${game.stats.consecutive_failure_months}/6`,
        'bad'
      )
      if (game.stats.consecutive_failure_months >= 6) {
        alert('由于长期维护不善（连续6个月故障），您的 OJ 被视作关停。游戏结束。')
        gameOver.value = true
        return
      }
    } else {
      if (game.stats.consecutive_failure_months > 0) {
        addLog('✅ 系统状态已恢复正常，故障计数重置。', 'good')
      }
      game.stats.consecutive_failure_months = 0
    }

    let acad_need = 0
    if (game.features_unlocked.difficulty) acad_need += total_prob * 0.05
    if (game.features_unlocked.solution) acad_need += total_prob * 0.1
    let comm_need = 0
    if (game.features_unlocked.discuss) comm_need += total_users * 0.01

    game.resources.acad -= acad_need
    game.resources.comm -= comm_need

    let acad_gap = game.resources.acad < 0 ? Math.abs(game.resources.acad) : 0
    let comm_gap = game.resources.comm < 0 ? Math.abs(game.resources.comm) : 0

    if (comm_gap > 0) game.stats.comm_fail_months++
    if (game.date.month === 1 && game.stats.comm_fail_months >= 12 && total_users >= 10000) {
      let fine = total_users
      game.money -= fine
      addLog(`⚖️ 监管通知: 因长期社区维护不善，罚款 ${fine} 元！`, 'bad')
      game.stats.comm_fail_months = 0
    }

    let server_gap = Math.max(0, load - server_cap)
    let judge_gap = Math.max(0, load - judge_cap)

    calculateReputation(acad_gap, comm_gap, server_gap, judge_gap, total_prob)

    for (const k in game.class_state) {
      const state = game.class_state[k]
      if (state && state.cooldown > 0) state.cooldown--
    }

    if (game.flags.fundraising_penalty_val > 0) {
      game.flags.fundraising_penalty_val -= 0.2 / 12
      if (game.flags.fundraising_penalty_val < 0) game.flags.fundraising_penalty_val = 0
    }
    if (game.flags.temp_rep_penalty > 0) {
      game.flags.temp_rep_penalty = Math.max(0, game.flags.temp_rep_penalty - 0.1 / 3)
    }

    if (game.money < 0) {
      alert('资金链断裂！您破产了！')
      gameOver.value = true
    }
  }

  const convertAP = (target: 'rd' | 'acad' | 'comm') => {
    if (game.ap < 10) {
      addLog('AP不足', 'bad')
      return
    }
    game.ap -= 10
    game.resources[target] += 10
    addLog(`行动: 10 AP -> 10 ${target}点`)
  }

  const addProblem = (type: 'high' | 'mid' | 'low') => {
    if (game.resources.acad < GAME_PARAMS.COSTS.ADD_PROBLEM_ACAD) {
      addLog('学术不足', 'bad')
      return
    }
    game.resources.acad -= GAME_PARAMS.COSTS.ADD_PROBLEM_ACAD

    if (type === 'mid' || type === 'low') {
      let bonus = Math.floor(Math.random() * 41) + 10
      game.stats.pending_user_bonus = (game.stats.pending_user_bonus || 0) + bonus
    }

    if (type === 'high') game.stats.problems.high += 3
    if (type === 'mid') game.stats.problems.mid += 10
    if (type === 'low') {
      game.stats.problems.low += 20
      game.stats.reputation -= 0.001
    }
    addLog(`题库: 增加 ${type} 试题`)
  }

  const organizeContest = (key: string) => {
    const conf = GAME_PARAMS.CONTESTS[key]
    if (!conf) return
    if (game.money < conf.cost || game.resources.acad < conf.acad) {
      addLog('资源不足', 'bad')
      return
    }
    game.money -= conf.cost
    game.resources.acad -= conf.acad

    if (conf.prob_mid) game.stats.problems.mid += conf.prob_mid
    if (conf.prob_low) game.stats.problems.low += conf.prob_low
    if (conf.prob_high) game.stats.problems.high += conf.prob_high

    if (conf.rep_pen) game.flags.temp_rep_penalty += conf.rep_pen
    if (conf.rep_gain) game.stats.reputation += conf.rep_gain
    if (conf.growth_mult) game.flags.contest_growth_mult = conf.growth_mult

    addLog(`比赛: ${conf.name} (下月增长 x${conf.growth_mult})`)
  }

  const fundraising = () => {
    if (game.ap < 50) return
    game.ap -= 50
    const u = game.stats.users
    const total_users = u.normal + u.active + u.core
    let gain = Math.floor(total_users * (game.stats.reputation + 1) * 5)
    if (gain < 0) gain = 0

    game.money += gain
    game.flags.fundraising_penalty_val += 0.2
    addLog(`募捐: 获得 ${gain} 元，声誉受损`, 'bad')
  }

  const hire = (key: string) => {
    if (game.ap < GAME_PARAMS.COSTS.HIRE_AP) return
    const conf = GAME_PARAMS.HIRING[key]
    if (!conf) return
    const current = game.staff[key] ?? 0
    if (current >= conf.limit) {
      addLog('人数已满', 'bad')
      return
    }
    game.staff[key] = current + 1
    game.ap -= GAME_PARAMS.COSTS.HIRE_AP
    addLog(`招聘: ${conf.name}`)
  }

  const expandHardware = (type: 'server' | 'judge' | 'disk', mode: number | 'max') => {
    mode = mode || 1

    if (type === 'disk') {
      const count = typeof mode === 'number' ? mode : 1
      game.hardware.disk_extra_blocks += count
      addLog(`硬件: 硬盘扩容 (+${count * 40}GB)`)
      return
    }

    const isServer = type === 'server'
    const arch = isServer ? game.hardware.server_arch : game.hardware.judge_arch
    const current = isServer ? game.hardware.server_cores : game.hardware.judge_cores
    const limit_base = isServer ? 32 : 64
    const limit = limit_base * arch

    let count = 0
    if (mode === 'max') {
      count = limit - current
    } else {
      count = mode as number
    }

    if (count <= 0) {
      addLog('已达到架构上限，无法添加', 'bad')
      return
    }

    if (current + count > limit) {
      count = limit - current
      if (count <= 0) {
        addLog('核心数已达架构上限，请先升级架构', 'bad')
        return
      }
    }

    if (isServer) {
      game.hardware.server_cores += count
    } else {
      game.hardware.judge_cores += count
    }

    addLog(`硬件: ${isServer ? 'Web' : '评测'}核心 +${count}`)
  }

  const upgradeArch = (type: 'server' | 'judge') => {
    const level = type === 'server' ? game.hardware.server_arch : game.hardware.judge_arch
    const cost_m = 10000 * level
    const cost_r = 100 * level
    if (game.money < cost_m || game.resources.rd < cost_r) {
      addLog('资源不足', 'bad')
      return
    }
    game.money -= cost_m
    game.resources.rd -= cost_r
    if (type === 'server') {
      game.hardware.server_arch++
    } else {
      game.hardware.judge_arch++
    }
    addLog('研发: 架构升级成功', 'good')
  }

  const unlockFeature = (id: string) => {
    const f = GAME_PARAMS.FEATURES[id]
    if (!f) return
    if (game.money < f.cost || game.resources.rd < f.rd) {
      addLog('资源不足', 'bad')
      return
    }
    game.money -= f.cost
    game.resources.rd -= f.rd
    game.features_unlocked[id] = true
    addLog(`解锁: ${f.name}`, 'good')
  }

  const runClass = (id: string) => {
    const conf = GAME_PARAMS.CLASSES[id]
    const st = game.class_state[id]
    if (!conf || !st) return
    if (conf.season && !conf.season.includes(game.date.month)) {
      addLog('季节不符 (需7-10月)', 'bad')
      return
    }
    if (st.cooldown > 0) return
    if (game.money < conf.req_money || game.resources.acad < conf.req_acad) {
      addLog('无法开课 (资源不足)', 'bad')
      return
    }

    game.money -= conf.req_money
    game.resources.acad -= conf.req_acad
    game.money += conf.inc_base * st.level
    st.cooldown = 3
    addLog(`网校: ${conf.name} 开课`, 'good')
  }

  const upgradeClass = (id: string) => {
    const conf = GAME_PARAMS.CLASSES[id]
    const st = game.class_state[id]
    if (!conf || !st) return
    if (st.level >= conf.max) return

    const cm = conf.cost_base * st.level
    const ca = conf.acad_base * st.level

    if (game.money < cm || game.resources.acad < ca) {
      addLog('升级资源不足', 'bad')
      return
    }
    game.money -= cm
    game.resources.acad -= ca
    st.level++
    addLog(`网校: 升级 ${conf.name}`, 'good')
  }

  const endGame = () => {
    const u = game.stats.users
    const p = game.stats.problems
    const score =
      (u.core / 3) +
      (u.active / 10) +
      (u.normal / 100) +
      (3 * p.high + p.mid - p.low) +
      0.01 * game.stats.total_solutions
    const finalScore = score * (game.stats.reputation + 1)
    alert(`游戏结束！最终得分: ${finalScore.toFixed(2)}`)
    gameOver.value = true
  }

  const forecast = computed(() => {
    let salary = 0
    for (const k in game.staff) {
      const staffCount = game.staff[k]
      const hiringConf = GAME_PARAMS.HIRING[k]
      if (staffCount !== undefined && hiringConf) {
        salary += staffCount * hiringConf.cost
      }
    }

    let hw_cost = game.hardware.disk_extra_blocks * GAME_PARAMS.COSTS.DISK_BLOCK_RENT
    const next_month = game.date.month + 1
    const next_year = game.date.year
    const will_charge_hw =
      next_year > 2013 || (next_year === 2013 && next_month >= 7)
    if (will_charge_hw) {
      hw_cost += game.hardware.server_cores * GAME_PARAMS.COSTS.SERVER_CORE_RENT
      hw_cost += game.hardware.judge_cores * GAME_PARAMS.COSTS.JUDGE_CORE_RENT
    }
    const total_expense = salary + hw_cost

    let api_income = 0
    if (game.features_unlocked.api) {
      const total_users = game.stats.users.normal + game.stats.users.active + game.stats.users.core
      api_income = Math.floor(total_users * 1.0)
    }
    const total_income = GAME_PARAMS.INCOME.MONTHLY_GRANT + api_income

    let m_rd = 0,
      m_acad = 0,
      m_comm = 0
    for (const k in GAME_PARAMS.FEATURES) {
      if (game.features_unlocked[k]) {
        const feature = GAME_PARAMS.FEATURES[k]
        if (feature) m_rd += feature.maintain
      }
    }
    m_rd += 20 * (game.hardware.server_arch - 1) + 20 * (game.hardware.judge_arch - 1)
    const total_prob = game.stats.problems.high + game.stats.problems.mid + game.stats.problems.low
    if (game.features_unlocked.difficulty) m_acad += total_prob * 0.05
    if (game.features_unlocked.solution) m_acad += total_prob * 0.1
    if (game.features_unlocked.discuss) {
      m_comm += (game.stats.users.normal + game.stats.users.active + game.stats.users.core) * 0.01
    }

    const net = total_income - total_expense

    return {
      income: total_income,
      salary,
      hw_cost,
      net,
      rd_cost: m_rd,
      acad_cost: m_acad,
      comm_cost: m_comm
    }
  })

  const loadInfo = computed(() => {
    const server_arch_bonus = (game.hardware.server_arch - 1) * 100
    const judge_arch_bonus = (game.hardware.judge_arch - 1) * 100

    const server_cap_unit =
      500 -
      (game.features_unlocked.team ? 50 : 0) -
      (game.features_unlocked.api ? 50 : 0) +
      server_arch_bonus
    const judge_cap_unit = 500 + judge_arch_bonus

    const server_cap = game.hardware.server_cores * server_cap_unit
    const judge_cap = game.hardware.judge_cores * judge_cap_unit

    const u = game.stats.users
    let load = Math.floor(u.active + u.normal / 3 + u.core * 3)
    if ([7, 8, 9, 10].includes(game.date.month)) load = Math.floor(load * 1.3)

    return {
      load,
      server_cap,
      judge_cap,
      is_server_overload: load > server_cap,
      is_judge_overload: load > judge_cap
    }
  })

  const diskInfo = computed(() => {
    const disk_cap =
      GAME_PARAMS.INITIAL.DISK_MB +
      game.hardware.disk_extra_blocks * GAME_PARAMS.COSTS.DISK_BLOCK_SIZE_GB * 1024
    return {
      used: game.hardware.disk_used,
      cap: disk_cap,
      is_full: game.hardware.disk_used > disk_cap
    }
  })

  const staffOutput = computed(() => {
    const h = GAME_PARAMS.HIRING
    return {
      rd:
        (game.staff.rd_student ?? 0) * (h.rd_student?.gain ?? 0) +
        (game.staff.rd_uni ?? 0) * (h.rd_uni?.gain ?? 0) +
        (game.staff.rd_full ?? 0) * (h.rd_full?.gain ?? 0),
      acad:
        (game.staff.acad_part ?? 0) * (h.acad_part?.gain ?? 0) +
        (game.staff.acad_full ?? 0) * (h.acad_full?.gain ?? 0),
      comm:
        (game.staff.comm_part ?? 0) * (h.comm_part?.gain ?? 0) +
        (game.staff.comm_full ?? 0) * (h.comm_full?.gain ?? 0)
    }
  })

  const isBankruptWarning = computed(() => {
    return game.money + forecast.value.net < 0
  })

  const switchTab = (tab: TabType) => {
    activeTab.value = tab
  }

  return {
    game,
    logs,
    activeTab,
    gameOver,
    init,
    addLog,
    nextMonth,
    convertAP,
    addProblem,
    organizeContest,
    fundraising,
    hire,
    expandHardware,
    upgradeArch,
    unlockFeature,
    runClass,
    upgradeClass,
    endGame,
    forecast,
    loadInfo,
    diskInfo,
    staffOutput,
    isBankruptWarning,
    switchTab
  }
}
