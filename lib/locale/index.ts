import enUS from './en-US'
import zhCN from './zh-CN'
import { type Messages, type Language } from './define'
import { ref, type ComputedRef, computed, type Ref } from 'vue'

const locale = ref<Messages>(enUS)
const currentLanguage = ref<Language>('en-US')

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

function $t(key: keyof Messages, defaultValue?: string): ComputedRef<string>
function $t(key: keyof Messages, attr: Record<string, string | number>, defaultValue?: string): ComputedRef<string>
function $t(
  key: keyof Messages,
  attr1?: string | Record<string, string | number>,
  attr2?: string
): ComputedRef<string> {
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
  currentLanguage.value = lang || 'en-US'
}

export function getCurrentLanguage(): Ref<Language> {
  return currentLanguage
}

/**
 * function t will return a string value
 * function $t will return ComputedRef<string>
 */
export function useI18n(s?: Language) {
  if (s) {
    changeLanguage(s)
  }
  return {
    t,
    $t,
  }
}

export type T = typeof t
export type $T = typeof $t
export type { Language }
