function monacoReady() {
  cy.visit('/')
  cy.get('.monaco-tree-editor-list-file-item div[data-src="/test1.html"]').should('be.visible')
}

function getFileTreeItem(path: string) {
  return cy.get(`.monaco-tree-editor-list-file-item div[data-src="${path}"]`)
}
function getEditor() {
  return cy.get('#editor')
}

describe('test crud1', () => {
  it('create file', () => {
    monacoReady()
    const testFileName = '__test-create-file.txt'
    cy.get('.monaco-tree-editor .monaco-tree-editor-list-wrapper').realHover()
    cy.get('.monaco-tree-editor-list-split .monaco-tree-editor-list-split-icon:first').realClick()
    cy.focused().realType(`${testFileName}{enter}`)
    getFileTreeItem('/' + testFileName).should('be.visible')
  })

  it('edit file', () => {
    monacoReady()
    const item = getFileTreeItem('/test1.html').should('be.visible')
    item.rightclick()
    cy.get('.context-menu').should('be.visible').contains('Open File').realClick()
    const editor = getEditor().should('be.visible')
    editor.find('.monaco-mouse-cursor-text .view-line:first').realClick()
    getEditor().type('{ctrl+a}{backspace}{ctrl+s}')
    cy.get('.monaco-tree-editor-opened-tab .monaco-tree-editor-opened-tab-item-editing').should('not.be.visible')
  })

  it('delete file', () => {
    monacoReady()
    const item = getFileTreeItem('/test1.html').should('be.visible').realHover()
    item.find('[title="Delete"]').should('be.visible').realClick()
    const modal = cy.get('.monaco-tree-editor-modal').should('be.visible')
    modal.find('.monaco-tree-editor-button-warn').realClick()
    getFileTreeItem('/test1.html').should('not.exist')
  })

  it('delete file2', () => {
    monacoReady()
    const item = getFileTreeItem('/test1.html').should('be.visible')
    item.rightclick()
    cy.get('.context-menu').should('be.visible').contains('Delete File').realClick()
    const modal = cy.get('.monaco-tree-editor-modal').should('be.visible')
    modal.find('.monaco-tree-editor-button-warn').realClick()
    getFileTreeItem('/test1.html').should('not.exist')
  })
})
