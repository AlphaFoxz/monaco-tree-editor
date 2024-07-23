import { test } from 'vitest'
import { Editor, useMessage, useHotkey, useMonaco } from '~'
import { expect } from 'vitest'

test('exports check', () => {
  // console.debug(Editor)
  console.debug(useMessage)
  console.debug(useHotkey)
  console.debug(useMonaco)
})
