describe('test drag and drop', async () => {
  it('test .ts file', () => {
    $fun.monacoReady()
    const item = $fun.getFileTreeItem($val.existingFilePath).should('be.visible')
    item.rightclick()
    cy.get('.context-menu').should('be.visible').contains('Open File').realClick()
    const dataTransfer = new DataTransfer()
    item.trigger('dragstart', { dataTransfer })
    cy.get('#editor .view-line:first').trigger('drop', { dataTransfer })
    cy.get('#editor .view-line:first').trigger('dragend')
    cy.get('#editor .view-line:first').trigger('dragend')
    cy.get('#editor .view-line:first').should((t) => {
      assert.match(t.text(), /^import/g)
    })
  })
})
