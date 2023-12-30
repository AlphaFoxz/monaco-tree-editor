import enUS from './en-US'
import zhCN from './zh-CN'
import type { Messages, Language } from './define'
import { ref, type ComputedRef, computed } from 'vue'

const locale = ref<Messages>(enUS)

function t(key: keyof Messages, defaultValue?: string): string
function t(key: keyof Messages, attr: Record<string, string | number>, defaultValue?: string): string
function t(key: keyof Messages, attr1?: string | Record<string, string | number>, attr2?: string): string {
  let v = locale.value[key]
  if (!v) {
    if (typeof attr1 === 'string') {
      v = attr1
    } else if (typeof attr2 === 'string') {
      v = attr2
    }
  }
  if (!v) {
    return ''
  }
  if (typeof attr1 === 'object') {
    v = v.replace(/\{\s*([a-zA-z_]+)\s*\}/g, (_, name) => {
      return String(attr1[name])
    })
  }
  return v
}

function r(key: keyof Messages, defaultValue?: string): ComputedRef<string>
function r(key: keyof Messages, attr: Record<string, string | number>, defaultValue?: string): ComputedRef<string>
function r(key: keyof Messages, attr1?: string | Record<string, string | number>, attr2?: string): ComputedRef<string> {
  if (typeof attr1 === 'object') {
    return computed(() => t(key, attr1, attr2))
  }
  return computed(() => t(key, attr1))
}

export function changeLanguage(lang: Language) {
  switch (lang) {
    case 'en-US':
      locale.value = enUS
      break
    case 'zh-CN':
      locale.value = zhCN
      break
    default:
      const _: never = lang
  }
}

export function useI18n(s?: Language) {
  if (s) {
    changeLanguage(s)
  }
  return {
    t,
    r,
  }
}

export type T = typeof t
export type R = typeof r
export type { Language }
