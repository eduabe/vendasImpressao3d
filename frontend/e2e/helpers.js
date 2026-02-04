/**
 * Helper functions for E2E tests
 */

/**
 * Creates a test sale through the API
 */
async function criarVendaDeTeste(page, dadosVenda) {
  try {
    const response = await page.request.post("http://localhost:3001/api/vendas", {
      data: dadosVenda,
    });
    
    if (!response.ok()) {
      const errorText = await response.text();
      throw new Error(`Failed to create sale: ${response.status()} - ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating test sale:', error);
    throw error;
  }
}

/**
 * Navigates to the sales list page
 */
async function navegarParaListaDeVendas(page) {
  await page.goto("http://localhost:3000");
  await page.waitForSelector('[data-testid="sale-list"]', { timeout: 10000 });
}

/**
 * Selects a sale from the list by description
 */
async function selecionarVenda(page, descricao) {
  const vendaSelector = `[data-testid="sale-item"][data-descricao="${descricao}"]`;
  await page.waitForSelector(vendaSelector, { timeout: 5000 });
  
  // Click the edit button in the sale row
  const editButton = page.locator(vendaSelector).locator('button[title="Editar"]');
  await editButton.click();
  
  // Wait for the form to appear
  await page.waitForSelector('[data-testid="sale-form"]', { timeout: 5000 });
}

/**
 * Fills the sale form with provided data
 */
async function preencherFormulario(page, campos) {
  if (campos.custoImpressao !== undefined) {
    await page.fill('[data-testid="custo-impressao-input"]', campos.custoImpressao.toString());
  }
  if (campos.custoEnvio !== undefined) {
    await page.fill('[data-testid="custo-envio-input"]', campos.custoEnvio.toString());
  }
  if (campos.valorRecebido !== undefined) {
    await page.fill('[data-testid="valor-recebido-input"]', campos.valorRecebido.toString());
  }
  if (campos.descricao !== undefined) {
    await page.fill('[data-testid="descricao-input"]', campos.descricao);
  }
  if (campos.plataformaId !== undefined) {
    await page.selectOption('[data-testid="plataforma-select"]', campos.plataformaId.toString());
  }
}

/**
 * Saves the form changes
 */
async function salvarAlteracoes(page) {
  const submitButton = page.locator('[data-testid="submit-button"]');
  await submitButton.click();
  
  // Wait for success toast to appear
  await page.waitForSelector('.toast-success', { timeout: 10000 }).catch(() => {
    // Fallback: wait for any toast element
    return page.waitForSelector('[class*="toast"]', { timeout: 10000 });
  });
}

/**
 * Deletes a test sale by ID
 */
async function deletarVendaDeTeste(page, id) {
  try {
    await page.request.delete(`http://localhost:3001/api/vendas/${id}`);
  } catch (error) {
    console.error('Error deleting test sale:', error);
    // Don't throw error, just log it
  }
}

module.exports = {
  criarVendaDeTeste,
  navegarParaListaDeVendas,
  selecionarVenda,
  preencherFormulario,
  salvarAlteracoes,
  deletarVendaDeTeste,
};