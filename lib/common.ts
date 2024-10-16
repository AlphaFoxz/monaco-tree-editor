import { type Ref, shallowReadonly, readonly } from 'vue'

/**
 * 函数防抖（间隔不超过delay毫秒的多次调用会被合并为最后一次调用，最终延迟时间为[delay]毫秒）
 * @param fn 目标函数
 */
export function debounce(fn: Function, delay: number = 500): Function {
  let timer: NodeJS.Timeout
  return function () {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn()
    }, delay)
  }
}

/**
 * 函数节流（每次触发后，在delay毫秒内不再触发）
 * @param fn 目标函数
 */
export function throttle(fn: Function, delay: number = 500): Function {
  let refuse = false
  return function () {
    if (refuse) return
    refuse = true
    fn(...arguments)
    setTimeout(() => {
      refuse = false
    }, delay)
  }
}

export function longestCommonPrefix(strs: string[]): string {
  if (!strs.length) return ''
  let [a, ...b] = strs
  let result = ''
  for (let i = 0; i < a.length; i++) {
    let flag = b.every((item) => item[i] === a[i])
    if (flag) result += a[i]
    else break
  }
  return result
}

export function defineApi<
  S1 extends { [k: string]: object },
  S2 extends { [k: string]: object },
  A1 extends { [k: string]: Function },
  A2 extends { [k: string]: Function }
>(option: { _state?: S1; state?: S2; _action?: A1; action?: A2 }) {
  type ReadonlyStates<T> = {
    readonly [P in keyof T]: T[P] extends Ref
      ? Readonly<Ref<T[P]['value']>>
      : T[P] extends object
      ? Readonly<T[P]>
      : ReadonlyStates<T[P]>
  }
  type ReadonlyActions<T> = {
    readonly [P in keyof T]: T[P] extends Function ? T[P] : never
  }
  const _state = shallowReadonly(option._state || {}) as ReadonlyStates<S1>
  const state = shallowReadonly(option.state || {}) as ReadonlyStates<S2>
  const _action = readonly(option._action || {}) as ReadonlyActions<A1>
  const action = readonly(option.action || {}) as ReadonlyActions<A2>
  return shallowReadonly({
    _state,
    state,
    _action,
    action,
  })
}
