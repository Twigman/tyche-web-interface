export interface TimerEntry {
  id: string
  remainingTime: number
}

export interface Timer {
  id?: string
  label?: string
  type: string
  time: string
  action: TIMER_ACTION
  message?: string
}

export enum TIMER_ACTION {
  BLINK_KITCHEN,
  BLINK_LIVINGROOM,
}
