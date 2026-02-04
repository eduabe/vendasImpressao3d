const { test, expect } = require("@playwright/test");
const {
  criarVendaDeTeste,
  navegarParaListaDeVendas,
  selecionarVenda,
  preencherFormulario,
  salvarAlteracoes,
  deletarVendaDeTeste,
} = require("./helpers");

test.describe("Atualização de Vendas - E2E", () => {
  let testSaleId = null;
  
  test.beforeAll(async ({ request }) => {
    // Get first platform to use in tests
    const platformsResponse = await request.get("http://localhost:3001/api/plataformas");
    const platforms = await platformsResponse.json();
    
    if (!platforms || platforms.length === 0) {
      throw new Error("No platforms found in database. Please create at least one platform before running tests.");
    }
  });

  test.beforeEach(async ({ page, request }) => {
    // Create a test sale before each test
    const vendaDeTeste = {
      descricao: "E2E_Venda Teste",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: 1,
      origemVenda: "Instagram",
      status: "Em Produção"
    };

    try {
      const createdSale = await criarVendaDeTeste(page, vendaDeTeste);
      testSaleId = createdSale.id;
    } catch (error) {
      console.error("Failed to create test sale:", error);
      throw error;
    }
  });

  test.afterEach(async ({ page }) => {
    // Clean up test sale after each test
    if (testSaleId) {
      await deletarVendaDeTeste(page, testSaleId);
      testSaleId = null;
    }
  });

  test("deve atualizar custoImpressao e custoEnvio e persistir corretamente", async ({
    page,
  }) => {
    // GIVEN: User is on the sales list
    await navegarParaListaDeVendas(page);

    // WHEN: User selects the test sale
    await selecionarVenda(page, "E2E_Venda Teste");

    // AND: User changes the cost values
    await preencherFormulario(page, {
      custoImpressao: 15.0,
      custoEnvio: 25.0,
    });

    // AND: User saves the changes
    await salvarAlteracoes(page);

    // THEN: Success message is displayed (toast)
    await expect(page.locator('[class*="toast"]')).toBeVisible();

    // AND: User is redirected back to the sales list
    await page.waitForSelector('[data-testid="sale-list"]', { timeout: 5000 });
    await expect(page.locator('[data-testid="sale-list"]')).toBeVisible();

    // AND: User selects the sale again to verify persistence
    await selecionarVenda(page, "E2E_Venda Teste");

    // AND: The updated values are displayed in the form
    const custoImpressaoValue = await page.inputValue(
      '[data-testid="custo-impressao-input"]'
    );
    const custoEnvioValue = await page.inputValue('[data-testid="custo-envio-input"]');

    expect(parseFloat(custoImpressaoValue)).toBe(15.0);
    expect(parseFloat(custoEnvioValue)).toBe(25.0);
  });

  test("deve manter valores de custo após recarregar a página", async ({
    page,
  }) => {
    // GIVEN: User edited and saved a sale with new costs
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");
    await preencherFormulario(page, {
      custoImpressao: 15.0,
      custoEnvio: 25.0,
    });
    await salvarAlteracoes(page);

    // WHEN: User reloads the page
    await page.reload();
    await page.waitForSelector('[data-testid="sale-list"]', { timeout: 10000 });

    // AND: User selects the sale again
    await selecionarVenda(page, "E2E_Venda Teste");

    // THEN: The values are still updated
    const custoImpressaoValue = await page.inputValue(
      '[data-testid="custo-impressao-input"]'
    );
    const custoEnvioValue = await page.inputValue('[data-testid="custo-envio-input"]');

    expect(parseFloat(custoImpressaoValue)).toBe(15.0);
    expect(parseFloat(custoEnvioValue)).toBe(25.0);
  });

  test("deve atualizar plataforma e custos simultaneamente", async ({ page, request }) => {
    // First, ensure we have at least 2 platforms
    const platformsResponse = await request.get("http://localhost:3001/api/plataformas");
    const platforms = await platformsResponse.json();
    
    if (platforms.length < 2) {
      test.skip();
      console.log("Skipping test: Need at least 2 platforms");
      return;
    }

    // GIVEN: User is on the sales list
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");

    // Record original values
    const plataformaOriginal = await page.inputValue('[data-testid="plataforma-select"]');

    // WHEN: User changes platform and costs
    const novaPlataformaId = platforms[1].id.toString();
    await preencherFormulario(page, {
      plataformaId: novaPlataformaId,
      custoImpressao: 15.0,
      custoEnvio: 25.0,
    });
    await salvarAlteracoes(page);

    // THEN: User selects the sale again to verify
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");

    // AND: Platform was changed
    const plataformaAtual = await page.inputValue('[data-testid="plataforma-select"]');
    expect(plataformaAtual).not.toBe(plataformaOriginal);
    expect(plataformaAtual).toBe(novaPlataformaId);

    // AND: Costs were updated
    const custoImpressaoValue = await page.inputValue(
      '[data-testid="custo-impressao-input"]'
    );
    const custoEnvioValue = await page.inputValue('[data-testid="custo-envio-input"]');

    expect(parseFloat(custoImpressaoValue)).toBe(15.0);
    expect(parseFloat(custoEnvioValue)).toBe(25.0);
  });

  test("deve exibir erro quando campos obrigatórios não são preenchidos", async ({
    page,
  }) => {
    // GIVEN: User is editing a sale
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");

    // WHEN: User leaves required field empty
    await page.fill('[data-testid="valor-recebido-input"]', "");
    await page.click('[data-testid="submit-button"]');

    // THEN: Submit button should be disabled or form should not submit
    // Wait a moment to see if form submits (it shouldn't)
    await page.waitForTimeout(1000);
    
    // AND: User is still on the form (no redirect happened)
    await expect(page.locator('[data-testid="sale-form"]')).toBeVisible();
    
    // AND: No success toast appeared
    await expect(page.locator('.toast-success')).not.toBeVisible();
  });

  test("deve atualizar descricao da venda", async ({ page }) => {
    // GIVEN: User is editing a sale
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");

    // WHEN: User changes the description
    const novaDescricao = "E2E_Venda Atualizada";
    await preencherFormulario(page, {
      descricao: novaDescricao,
    });
    await salvarAlteracoes(page);

    // THEN: Success message is displayed
    await expect(page.locator('[class*="toast"]')).toBeVisible();

    // AND: User navigates back to the list
    await page.waitForSelector('[data-testid="sale-list"]', { timeout: 5000 });

    // AND: User selects the sale again to verify
    await selecionarVenda(page, novaDescricao);

    // AND: The description is updated
    const descricaoValue = await page.inputValue('[data-testid="descricao-input"]');
    expect(descricaoValue).toBe(novaDescricao);
  });

  test("deve manter outros campos inalterados ao atualizar custos", async ({
    page,
  }) => {
    // GIVEN: User is editing a sale
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");

    // Record original values
    const valorRecebidoOriginal = await page.inputValue('[data-testid="valor-recebido-input"]');
    const plataformaOriginal = await page.inputValue('[data-testid="plataforma-select"]');
    const descricaoOriginal = await page.inputValue('[data-testid="descricao-input"]');

    // WHEN: User updates only costs
    await preencherFormulario(page, {
      custoImpressao: 18.5,
      custoEnvio: 22.3,
    });
    await salvarAlteracoes(page);

    // AND: User selects the sale again
    await navegarParaListaDeVendas(page);
    await selecionarVenda(page, "E2E_Venda Teste");

    // THEN: Costs were updated
    const custoImpressaoValue = await page.inputValue('[data-testid="custo-impressao-input"]');
    const custoEnvioValue = await page.inputValue('[data-testid="custo-envio-input"]');
    expect(parseFloat(custoImpressaoValue)).toBe(18.5);
    expect(parseFloat(custoEnvioValue)).toBe(22.3);

    // AND: Other fields remain unchanged
    const valorRecebidoAtual = await page.inputValue('[data-testid="valor-recebido-input"]');
    const plataformaAtual = await page.inputValue('[data-testid="plataforma-select"]');
    const descricaoAtual = await page.inputValue('[data-testid="descricao-input"]');

    expect(valorRecebidoAtual).toBe(valorRecebidoOriginal);
    expect(plataformaAtual).toBe(plataformaOriginal);
    expect(descricaoAtual).toBe(descricaoOriginal);
  });
});