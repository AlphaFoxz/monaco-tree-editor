import { createAgg } from 'vue-fn/domain'
import { type ComputedRef, computed, ref } from 'vue'
import enUS from '../locale/en-US'
import zhCN from '../locale/zh-CN'
import { type Messages } from '../define'

export const validLanguages = ['en-US', 'zh-CN'] as const
export type Language = (typeof validLanguages)[number]

const i18nAgg = createAgg(() => {
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

  function setLanguage(lang: Language) {
    if (lang === 'en-US') {
      locale.value = enUS
    } else if (lang === 'zh-CN') {
      locale.value = zhCN
    } else {
      isNever(lang)
    }
    currentLanguage.value = lang || 'en-US'
  }
  return {
    states: {
      currentLanguage,
    },
    actions: {
      setLanguage,
      t,
      $t,
    },
  }
})

export function useI18n() {
  return i18nAgg.api
}
