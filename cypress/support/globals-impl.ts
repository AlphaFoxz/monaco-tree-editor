type Globalval = {
  existingFileName: string
  existingFilePath: string
}
type GlobalFun = {
  monacoReady: () => void
  getEditor: () => ReturnType<typeof getEditor>
  getFileTreeItem: (path: string) => ReturnType<typeof getFileTreeItem>
}

function getEditor() {
  return cy.get('#editor')
}

function getFileTreeItem(path: string) {
  return cy.get(`.monaco-tree-editor-list-file-item div[data-src="${path}"]`)
}

let val: Globalval = {
  existingFileName: 'test1.ts',
  existingFilePath: '/test1.ts',
}
let fun: GlobalFun = {
  monacoReady() {
    cy.visit('/')
    cy.get(`.monaco-tree-editor-list-file-item div[data-src="${val.existingFilePath}"]`).should('be.visible')
  },
  getEditor,
  getFileTreeItem,
}
;(globalThis as any).$val = val
;(globalThis as any).$fun = fun
