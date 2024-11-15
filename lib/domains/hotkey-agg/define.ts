import { type KeyName, toFacadeKey } from '../define'

export type When = 'root' | 'editor'
export type Command = 'Format' | 'Save' | 'DeleteFile'

export function hotkeyToJsonString(hotkey: IHotkey) {
  return JSON.stringify({
    when: hotkey.when,
    key: hotkey.key,
    command: hotkey.command,
    ctrlKey: hotkey.ctrlKey,
    altKey: hotkey.altKey,
    shiftKey: hotkey.shiftKey,
  })
}
export function jsonStringToHotkey(json: string) {
  const { when, key, command, ctrlKey, altKey, shiftKey } = JSON.parse(json)
  return new Hotkey({ when, key, command, ctrlKey, altKey, shiftKey })
}
export function jsonToHotkey<T extends object>(json: T) {
  const { when, key, command, ctrlKey, altKey, shiftKey } = json as any
  return new Hotkey({ when, key, command, ctrlKey, altKey, shiftKey })
}

export interface IHotkey {
  readonly when: When
  readonly key: KeyName | undefined
  readonly command: Command
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly shiftKey: boolean
  isMatch(e: KeyboardEvent): boolean
}
export type HotkeyOptions = {
  when: When
  key: KeyName | undefined
  command: Command
  ctrlKey?: boolean
  altKey?: boolean
  shiftKey?: boolean
}
export class Hotkey implements IHotkey {
  readonly when: When
  readonly key: KeyName | undefined
  readonly command: Command
  readonly ctrlKey: boolean
  readonly altKey: boolean
  readonly shiftKey: boolean
  constructor(options: HotkeyOptions) {
    const { when, key, command, ctrlKey, altKey, shiftKey } = options
    this.command = command
    this.key = key
    this.when = when
    this.ctrlKey = ctrlKey || false
    this.altKey = altKey || false
    this.shiftKey = shiftKey || false
  }
  isMatch(e: KeyboardEvent) {
    return (
      this.key === toFacadeKey(e.key) &&
      e.ctrlKey === this.ctrlKey &&
      e.altKey === this.altKey &&
      e.shiftKey === this.shiftKey
    )
  }
}
export type CommandsHandler = (hotkeys: IHotkey, e: KeyboardEvent) => void

export const IDEA_KEYBINDINGS: IHotkey[] = [
  new Hotkey({ when: 'editor', command: 'Format', ctrlKey: true, altKey: true, key: 'L' }),
  new Hotkey({ when: 'editor', command: 'Save', ctrlKey: true, key: 'S' }),
]
