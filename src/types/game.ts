export interface Date {
  year: number
  month: number
}

export interface Resources {
  rd: number
  acad: number
  comm: number
}

export interface Users {
  normal: number
  active: number
  core: number
}

export interface Problems {
  high: number
  mid: number
  low: number
}

export interface LastMonth {
  subs: number
  sols: number
}

export interface Stats {
  users: Users
  problems: Problems
  total_submissions: number
  total_solutions: number
  reputation: number
  last_month: LastMonth
  consecutive_failure_months: number
  comm_fail_months: number
  pending_user_bonus: number
}

export interface Hardware {
  server_cores: number
  judge_cores: number
  disk_extra_blocks: number
  disk_used: number
  server_arch: number
  judge_arch: number
}

export interface Staff {
  [key: string]: number
}

export interface ClassState {
  [key: string]: {
    level: number
    cooldown: number
  }
}

export interface FeaturesUnlocked {
  [key: string]: boolean
}

export interface Flags {
  fundraising_penalty_val: number
  temp_rep_penalty: number
  contest_growth_mult: number
}

export interface GameState {
  date: Date
  money: number
  ap: number
  resources: Resources
  stats: Stats
  hardware: Hardware
  staff: Staff
  class_state: ClassState
  features_unlocked: FeaturesUnlocked
  flags: Flags
}

export interface HiringConfig {
  name: string
  cost: number
  gain: number
  limit: number
  type: 'rd' | 'acad' | 'comm'
}

export interface ContestConfig {
  name: string
  cost: number
  acad: number
  prob_mid?: number
  prob_low?: number
  prob_high?: number
  rep_pen?: number
  rep_gain?: number
  growth_mult: number
}

export interface FeatureConfig {
  id: string
  name: string
  cost: number
  rd: number
  maintain: number
  desc: string
}

export interface ClassConfig {
  name: string
  max: number
  cost_base: number
  acad_base: number
  inc_base: number
  req_money: number
  req_acad: number
  season?: number[]
}

export interface LogEntry {
  message: string
  type: 'normal' | 'good' | 'bad' | 'warn'
  date: string
}

export type TabType = 'ops' | 'rd' | 'hr' | 'edu'
