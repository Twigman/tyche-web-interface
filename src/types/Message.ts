export interface ConsoleLine {
  timestamp: number
  module: string
  type: string
  message: string
}

export interface StompWrapper<T> {
  module: string
  data: T
}

export const defaultStompWrapper = <T>(defaultValue: T): StompWrapper<T> => ({
  module: '',
  data: defaultValue,
})
