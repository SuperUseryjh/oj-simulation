import type { HiringConfig, ContestConfig, FeatureConfig, ClassConfig } from '../types/game'

export const GAME_PARAMS = {
  INITIAL: {
    YEAR: 2013,
    MONTH: 1,
    MONEY: 2000,
    AP: 100,
    USERS: 50,
    SERVER_CORES: 2,
    JUDGE_CORES: 1,
    DISK_MB: 20480
  },
  INCOME: {
    MONTHLY_GRANT: 500
  },
  COSTS: {
    SERVER_CORE_RENT: 200,
    JUDGE_CORE_RENT: 200,
    DISK_BLOCK_RENT: 100,
    DISK_BLOCK_SIZE_GB: 40,
    ADD_PROBLEM_ACAD: 20,
    HIRE_AP: 10
  },
  HIRING: {
    rd_student: { name: '高中兼职', cost: 1500, gain: 20, limit: 5, type: 'rd' },
    rd_uni: { name: '大学兼职', cost: 5000, gain: 75, limit: 5, type: 'rd' },
    rd_full: { name: '全职开发', cost: 12000, gain: 120, limit: 999, type: 'rd' },
    acad_part: { name: '现役选手', cost: 500, gain: 50, limit: 20, type: 'acad' },
    acad_full: { name: '全职教练', cost: 15000, gain: 400, limit: 999, type: 'acad' },
    comm_part: { name: '兼职版主', cost: 500, gain: 50, limit: 5, type: 'comm' },
    comm_full: { name: '全职运营', cost: 7500, gain: 400, limit: 999, type: 'comm' }
  } as Record<string, HiringConfig>,
  CONTESTS: {
    old: { name: '原题赛', cost: 500, acad: 40, prob_mid: 4, rep_pen: 0.1, growth_mult: 1.05 },
    water: { name: '水赛', cost: 1000, acad: 40, prob_low: 6, rep_pen: 0.1, growth_mult: 1.15 },
    normal: { name: '普通赛', cost: 3000, acad: 80, prob_mid: 4, growth_mult: 1.1 },
    grand: { name: '优秀赛', cost: 8000, acad: 200, prob_high: 3, rep_gain: 0.01, growth_mult: 1.1 }
  } as Record<string, ContestConfig>,
  FEATURES: {
    difficulty: {
      id: 'difficulty',
      name: '难度功能',
      cost: 1000,
      rd: 100,
      maintain: 0,
      desc: '让 OJ 支持难度评级，需要少量学术维护，可以吸引更多的用户使用你的 OJ'
    },
    solution: {
      id: 'solution',
      name: '题解功能',
      cost: 1000,
      rd: 100,
      maintain: 10,
      desc: '让 OJ 可以显示题解，需要学术维护，可以吸引更多的用户使用你的 OJ'
    },
    discuss: {
      id: 'discuss',
      name: '讨论区',
      cost: 5000,
      rd: 300,
      maintain: 20,
      desc: '让 OJ 有讨论区，需要社区维护，可以吸引更多的用户使用你的 OJ'
    },
    team: {
      id: 'team',
      name: '团队功能',
      cost: 10000,
      rd: 500,
      maintain: 30,
      desc: '让 OJ 拥有团队功能，可以吸引学校/机构使用 OJ，但是团队功能会降低服务器承载力'
    },
    school: {
      id: 'school',
      name: '网校功能',
      cost: 20000,
      rd: 800,
      maintain: 40,
      desc: '解锁网校课程'
    },
    api: {
      id: 'api',
      name: '评测API',
      cost: 30000,
      rd: 1500,
      maintain: 50,
      desc: '出售外部评测服务，获得大量稳定现金流，但是会降低服务器承载力'
    }
  } as Record<string, FeatureConfig>,
  USER_BEHAVIOR: {
    SUBMISSIONS: { normal: 15, active: 65, core: 300 },
    SOLUTIONS: { normal: 0.01, active: 1, core: 5 },
    GROWTH_FACTOR: 0.25,
    UPGRADE_N_A_BASE: 4,
    UPGRADE_N_A_MULT: 10,
    UPGRADE_A_C_MULT: 5
  },
  DISK_USAGE: {
    PROBLEM: 50,
    USER_DATA: 0.05,
    SUBMISSION: 0.002,
    SOLUTION: 0.005
  },
  CLASSES: {
    intro: {
      name: '入门课',
      max: 3,
      cost_base: 3000,
      acad_base: 100,
      inc_base: 10000,
      req_money: 4000,
      req_acad: 100
    },
    basic: {
      name: '基础课',
      max: 3,
      cost_base: 5000,
      acad_base: 150,
      inc_base: 15000,
      req_money: 6000,
      req_acad: 150
    },
    advanced: {
      name: '提高课',
      max: 5,
      cost_base: 10000,
      acad_base: 200,
      inc_base: 25000,
      req_money: 10000,
      req_acad: 240
    },
    sprint: {
      name: '冲刺班',
      max: 3,
      cost_base: 20000,
      acad_base: 200,
      inc_base: 40000,
      req_money: 20000,
      req_acad: 200,
      season: [7, 8, 9, 10]
    },
    national: {
      name: '国赛班',
      max: 5,
      cost_base: 25000,
      acad_base: 300,
      inc_base: 50000,
      req_money: 40000,
      req_acad: 400
    }
  } as Record<string, ClassConfig>
}
