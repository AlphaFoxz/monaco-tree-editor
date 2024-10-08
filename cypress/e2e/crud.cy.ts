function monacoReady() {
  cy.visit('/')
  cy.get('.monaco-tree-editor-list-file-item').should('not.be.empty')
}
const testFileName = '__test-create-file.txt'

describe('test crud1', () => {
  it('create file', () => {
    monacoReady()
    cy.get('.monaco-tree-editor .monaco-tree-editor-list-wrapper').realHover()
    cy.get('.monaco-tree-editor-list-split .monaco-tree-editor-list-split-icon:first').realClick()
    cy.focused().realType(`${testFileName}{enter}`)
    cy.get(`div[data-src="/${testFileName}"]`).should('be.visible')
  })

  it('edit file', () => {
    monacoReady()
  })

  it('delete file', () => {
    monacoReady()
  })
})
