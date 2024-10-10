describe('test crud1', () => {
  it('create file', () => {
    $fun.monacoReady()
    const newFileName = '__test-create-file.txt'
    cy.get('.monaco-tree-editor .monaco-tree-editor-list-wrapper').realHover()
    cy.get('.monaco-tree-editor-list-split .monaco-tree-editor-list-split-icon:first').realClick()
    cy.focused().realType(`${newFileName}{enter}`)
    $fun.getFileTreeItem('/' + newFileName).should('be.visible')
  })

  it('edit file', () => {
    $fun.monacoReady()
    const item = $fun.getFileTreeItem($val.existingFilePath).should('be.visible')
    item.rightclick()
    cy.get('.context-menu').should('be.visible').contains('Open File').realClick()
    const editor = $fun.getEditor().should('be.visible')
    editor.find('.monaco-mouse-cursor-text .view-line:first').realClick()
    $fun.getEditor().type('{ctrl+a}{backspace}{ctrl+s}')
    cy.get('.monaco-tree-editor-opened-tab .monaco-tree-editor-opened-tab-item-editing').should('not.be.visible')
  })

  it('delete file', () => {
    $fun.monacoReady()
    const item = $fun.getFileTreeItem($val.existingFilePath).should('be.visible').realHover()
    item.find('[title="Delete"]').should('be.visible').realClick()
    const modal = cy.get('.monaco-tree-editor-modal').should('be.visible')
    modal.find('.monaco-tree-editor-button-warn').realClick()
    $fun.getFileTreeItem($val.existingFilePath).should('not.exist')
  })

  it('delete file2', () => {
    $fun.monacoReady()
    const item = $fun.getFileTreeItem($val.existingFilePath).should('be.visible')
    item.rightclick()
    cy.get('.context-menu').should('be.visible').contains('Delete File').realClick()
    const modal = cy.get('.monaco-tree-editor-modal').should('be.visible')
    modal.find('.monaco-tree-editor-button-warn').realClick()
    $fun.getFileTreeItem($val.existingFilePath).should('not.exist')
  })
})
