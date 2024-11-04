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
