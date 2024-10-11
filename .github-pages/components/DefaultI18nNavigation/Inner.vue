<script setup lang="ts">
const { locale } = useI18n()
interface NavItem {
  title: string
  _path: string
  _id?: string
  _draft?: boolean
  children?: NavItem[]
  [key: string]: any
}

defineProps({
  navigation: {
    type: Array<NavItem>,
    required: true,
  },
})
</script>

<template>
  <ul>
    <template v-for="link of navigation" :key="link._path">
      <li v-if="link._path.startsWith(`/${locale}`)">
        <NuxtLink :to="link._path">{{ link.title }}</NuxtLink>
        <template v-if="link.children">
          <DefaultI18nNavigationInner :navigation="link.children" />
        </template>
      </li>
    </template>
  </ul>
</template>
