# Tarefa 3.0: Implementar testes E2E com Playwright

## Visão Geral

Esta tarefa implementa testes end-to-end (E2E) usando Playwright que validam o fluxo completo do usuário através da interface do frontend. Os testes E2E navegam pelo aplicativo como um usuário real, interagem com a interface de edição de vendas e validam que os campos de custo são persistidos corretamente após edição, incluindo validação de recarregamento de página.

## Objetivos

- Validar o fluxo completo do usuário ao editar uma venda no frontend
- Verificar visualmente que os valores de custo são atualizados na interface
- Validar que os valores persistem após recarregamento da página
- Garantir que a experiência do usuário final funciona corretamente

## Dependências

**Tarefas 1.0 e 2.0 devem estar completas** - Os testes E2E dependem da correção do bug ser implementada (Tarefa 1.0) e dos testes de integração validarem a persistência (Tarefa 2.0).

## Arquivos a Criar

- `frontend/e2e/sale-update.spec.js` - Testes E2E de atualização de vendas

## Pré-requisitos

- Playwright instalado no projeto frontend (`npm install -D @playwright/test`)
- Aplicação frontend rodando (ex: `npm start` ou `npm run dev`)
- Backend rodando e acessível
- Banco de dados PostgreSQL configurado e com dados de teste
- Pelo menos 2 plataformas cadastradas no banco
- Tarefas 1.0 e 2.0 completas

## Detalhamento da Implementação

### Subtarefas

#### 3.1 Instalar e configurar Playwright

**Descrição**: Instalar Playwright e configurar o ambiente de testes E2E no frontend.

**Ações**:

1. **Instalar Playwright**:

```bash
cd frontend
npm install -D @playwright/test
```

2. **Configurar Playwright**:

Criar arquivo `frontend/playwright.config.js`:

```javascript
const { defineConfig, devices } = require("@playwright/test");

module.exports = defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: "http://localhost:3000", // URL do frontend
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    // Opcional: Adicionar outros browsers
    // {
    //   name: "firefox",
    //   use: { ...devices["Desktop Firefox"] },
    // },
    // {
    //   name: "webkit",
    //   use: { ...devices["Desktop Safari"] },
    // },
  ],

  webServer: {
    command: "npm start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
  },
});
```

3. **Adicionar script de teste no `package.json`**:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:report": "playwright show-report"
  }
}
```

**Critérios de Sucesso**:

- [ ] Playwright está instalado corretamente
- [ ] Arquivo `playwright.config.js` está configurado
- [ ] Script `npm run test:e2e` funciona
- [ ] Frontend pode ser iniciado automaticamente pelos testes

#### 3.2 Criar helpers para testes E2E

**Descrição**: Criar funções auxiliares para facilitar a escrita dos testes E2E.

**Arquivo**: `frontend/e2e/helpers.js`

```javascript
/**
 * Cria uma venda de teste através da API ou UI
 */
async function criarVendaDeTeste(page, dadosVenda) {
  // Implementar criação de venda através da UI ou API
  // Exemplo usando a API diretamente:
  const response = await page.request.post("http://localhost:3001/api/vendas", {
    data: dadosVenda,
  });
  return await response.json();
}

/**
 * Navega para a lista de vendas
 */
async function navegarParaListaDeVendas(page) {
  await page.goto("/");
  await page.waitForSelector(".sale-list", { timeout: 5000 });
}

/**
 * Seleciona uma venda da lista
 */
async function selecionarVenda(page, descricao) {
  const vendaSelector = `[data-testid="sale-item"][data-descricao="${descricao}"]`;
  await page.click(vendaSelector);
  await page.waitForSelector(".sale-form", { timeout: 5000 });
}

/**
 * Preenche o formulário de edição
 */
async function preencherFormulario(page, campos) {
  if (campos.custoImpressao !== undefined) {
    await page.fill(
      'input[name="custoImpressao"]',
      campos.custoImpressao.toString(),
    );
  }
  if (campos.custoEnvio !== undefined) {
    await page.fill('input[name="custoEnvio"]', campos.custoEnvio.toString());
  }
  if (campos.plataformaId !== undefined) {
    await page.selectOption(
      'select[name="plataformaId"]',
      campos.plataformaId.toString(),
    );
  }
  // Adicionar outros campos conforme necessário
}

/**
 * Salva as alterações
 */
async function salvarAlteracoes(page) {
  await page.click('button[type="submit"]');
  await page.waitForSelector(".success-message", { timeout: 5000 });
}

module.exports = {
  criarVendaDeTeste,
  navegarParaListaDeVendas,
  selecionarVenda,
  preencherFormulario,
  salvarAlteracoes,
};
```

**Critérios de Sucesso**:

- [ ] Helpers estão implementados e funcionais
- [ ] Helpers facilitam a escrita de testes
- [ ] Helpers são reutilizáveis entre testes

#### 3.3 Implementar teste E2E principal de atualização de vendas

**Descrição**: Teste principal que valida o fluxo completo do usuário ao editar uma venda.

**Código do teste**:

```javascript
const { test, expect } = require("@playwright/test");
const {
  criarVendaDeTeste,
  navegarParaListaDeVendas,
  selecionarVenda,
  preencherFormulario,
  salvarAlteracoes,
} = require("./helpers");

test.describe("Atualização de Vendas - E2E", () => {
  test.beforeEach(async ({ page }) => {
    // Criar venda de teste antes de cada teste
    const vendaDeTeste = {
      descricao: "E2E_Venda Teste",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: 1,
      origemVenda: "manual",
      status: "concluida",
    };

    await criarVendaDeTeste(page, vendaDeTeste);
  });

  test("deve atualizar custoImpressao e custoEnvio e persistir corretamente", async ({
    page,
  }) => {
    // GIVEN: Usuário está na lista de vendas
    await navegarParaListaDeVendas(page);

    // WHEN: Usuário seleciona a venda de teste
    await selecionarVenda(page, "E2E_Venda Teste");

    // AND: Usuário altera os valores de custo
    await preencherFormulario(page, {
      custoImpressao: 15.0,
      custoEnvio: 25.0,
    });

    // AND: Usuário salva as alterações
    await salvarAlteracoes(page);

    // THEN: Mensagem de sucesso é exibida
    await expect(page.locator(".success-message")).toContainText(
      "atualizada com sucesso",
    );

    // AND: Usuário é redirecionado para a lista de vendas
    await expect(page.locator(".sale-list")).toBeVisible();

    // AND: Usuário seleciona a venda novamente para verificar persistência
    await selecionarVenda(page, "E2E_Venda Teste");

    // AND: Os valores atualizados são exibidos no formulário
    const custoImpressaoValue = await page.inputValue(
      'input[name="custoImpressao"]',
    );
    const custoEnvioValue = await page.inputValue('input[name="custoEnvio"]');

    expect(parseFloat(custoImpressaoValue)).toBe(15.0);
    expect(parseFloat(custoEnvioValue)).toBe(25.0);

    // AND: O lucro líquido foi recalculado corretamente
    const lucroLiquidoElement = await page.locator(
      '[data-testid="lucro-liquido"]',
    );
    await expect(lucroLiquidoElement).toBeVisible();
  });
});
```

**Critérios de Sucesso**:

- [ ] Teste navega para a lista de vendas
- [ ] Teste seleciona e edita uma venda
- [ ] Teste altera os campos de custo
- [ ] Teste salva as alterações
- [ ] Teste verifica mensagem de sucesso
- [ ] Teste verifica que valores foram persistidos corretamente
- [ ] Teste passa sem erros

#### 3.4 Implementar teste de persistência após recarregamento

**Descrição**: Teste que valida que os valores persistem mesmo após recarregamento da página.

**Código do teste**:

```javascript
test("deve manter valores de custo após recarregar a página", async ({
  page,
}) => {
  // GIVEN: Usuário editou e salvou uma venda com novos custos
  await navegarParaListaDeVendas(page);
  await selecionarVenda(page, "E2E_Venda Teste");
  await preencherFormulario(page, {
    custoImpressao: 15.0,
    custoEnvio: 25.0,
  });
  await salvarAlteracoes(page);

  // WHEN: Usuário recarrega a página
  await page.reload();
  await page.waitForSelector(".sale-list", { timeout: 5000 });

  // AND: Usuário seleciona a venda novamente
  await selecionarVenda(page, "E2E_Venda Teste");

  // THEN: Os valores ainda estão atualizados
  const custoImpressaoValue = await page.inputValue(
    'input[name="custoImpressao"]',
  );
  const custoEnvioValue = await page.inputValue('input[name="custoEnvio"]');

  expect(parseFloat(custoImpressaoValue)).toBe(15.0);
  expect(parseFloat(custoEnvioValue)).toBe(25.0);
});
```

**Critérios de Sucesso**:

- [ ] Teste salva alterações de custo
- [ ] Teste recarrega a página
- [ ] Teste navega para a venda novamente
- [ ] Valores permanecem atualizados após recarregamento
- [ ] Teste passa sem erros

#### 3.5 Implementar teste de atualização com mudança de plataforma

**Descrição**: Teste que valida a atualização completa quando mudando plataforma e custos simultaneamente.

**Código do teste**:

```javascript
test("deve atualizar plataforma e custos simultaneamente", async ({ page }) => {
  // GIVEN: Usuário está na lista de vendas
  await navegarParaListaDeVendas(page);
  await selecionarVenda(page, "E2E_Venda Teste");

  // Registrar valores originais
  const plataformaOriginal = await page.inputValue(
    'select[name="plataformaId"]',
  );

  // WHEN: Usuário altera plataforma e custos
  await preencherFormulario(page, {
    plataformaId: 2, // Mudar para plataforma 2
    custoImpressao: 15.0,
    custoEnvio: 25.0,
  });
  await salvarAlteracoes(page);

  // THEN: Usuário seleciona a venda novamente para verificar
  await navegarParaListaDeVendas(page);
  await selecionarVenda(page, "E2E_Venda Teste");

  // AND: Plataforma foi alterada
  const plataformaAtual = await page.inputValue('select[name="plataformaId"]');
  expect(parseInt(plataformaAtual)).not.toBe(parseInt(plataformaOriginal));
  expect(parseInt(plataformaAtual)).toBe(2);

  // AND: Custos foram atualizados
  const custoImpressaoValue = await page.inputValue(
    'input[name="custoImpressao"]',
  );
  const custoEnvioValue = await page.inputValue('input[name="custoEnvio"]');

  expect(parseFloat(custoImpressaoValue)).toBe(15.0);
  expect(parseFloat(custoEnvioValue)).toBe(25.0);

  // AND: Lucro líquido foi recalculado com base na nova plataforma
  const lucroLiquidoElement = await page.locator(
    '[data-testid="lucro-liquido"]',
  );
  await expect(lucroLiquidoElement).toBeVisible();
});
```

**Critérios de Sucesso**:

- [ ] Teste altera plataforma e custos simultaneamente
- [ ] Plataforma é atualizada corretamente
- [ ] Custos são atualizados corretamente
- [ ] Lucro líquido é recalculado com base na nova plataforma
- [ ] Teste passa sem erros

#### 3.6 Implementar teste de cenário de erro (campos obrigatórios)

**Descrição**: Teste que valida que a interface exibe mensagens de erro quando campos obrigatórios não são preenchidos.

**Código do teste**:

```javascript
test("deve exibir erro quando campos obrigatórios não são preenchidos", async ({
  page,
}) => {
  // GIVEN: Usuário está editando uma venda
  await navegarParaListaDeVendas(page);
  await selecionarVenda(page, "E2E_Venda Teste");

  // WHEN: Usuário deixa campos obrigatórios vazios
  await page.fill('input[name="valorRecebido"]', "");
  await page.click('button[type="submit"]');

  // THEN: Mensagem de erro é exibida
  await expect(page.locator(".error-message")).toBeVisible();
  await expect(page.locator(".error-message")).toContainText("obrigatório");

  // AND: Venda não é salva (usuário continua no formulário)
  await expect(page.locator(".sale-form")).toBeVisible();
});
```

**Critérios de Sucesso**:

- [ ] Teste deixa campo obrigatório vazio
- [ ] Mensagem de erro é exibida
- [ ] Formulário permanece visível (não houve redirecionamento)
- [ ] Teste passa sem erros

## Testes

### Testes E2E

**Arquivo**: `frontend/e2e/sale-update.spec.js`

**Cobertura esperada**: Validação completa do fluxo do usuário na interface

**Como executar**:

```bash
cd frontend

# Executar todos os testes E2E
npm run test:e2e

# Executar com interface gráfica
npm run test:e2e:ui

# Ver relatório após execução
npm run test:e2e:report
```

**Critérios de sucesso dos testes**:

- [ ] Todos os testes E2E passam
- [ ] Testes executam em menos de 30 segundos
- [ ] Testes são determinísticos (mesmo resultado em múltiplas execuções)
- [ ] Screenshots e vídeos são gerados em caso de falha

## Critérios de Aceite

### Funcionais

- [ ] Usuário pode editar custos de uma venda através da interface
- [ ] Valores atualizados são exibidos corretamente na interface
- [ ] Valores persistem após recarregamento da página
- [ ] Atualização com mudança de plataforma funciona corretamente
- [ ] Mensagens de erro são exibidas quando apropriado

### Técnicos

- [ ] Playwright está configurado e funcionando
- [ ] Testes são executados automaticamente pelo CI/CD (se aplicável)
- [ ] Screenshots são capturados em caso de falha
- [ ] Testes são independentes e não dependem da ordem de execução
- [ ] Helpers facilitam a manutenção dos testes

### Performance

- [ ] Tempo total de execução dos testes E2E < 30 segundos
- [ ] Cada teste individual executa em < 10 segundos
- [ ] Testes não são flaky (não falham intermitentemente)

## Pontos de Atenção

### Riscos

1. **Dependência de serviços externos**: Testes falham se backend ou banco não estiverem rodando
2. **Tempo de execução**: Testes E2E são mais lentos que unitários e de integração
3. **Seletors frágeis**: Seletores CSS podem quebrar se a UI mudar
4. **Estado do banco**: Testes podem depender de dados específicos no banco

### Mitigações

1. Verificar que backend e banco estão rodando antes de executar testes
2. Manter testes focados e executá-los apenas em branches principais ou PRs
3. Usar seletores estáveis como `data-testid` em vez de classes CSS
4. Criar e limpar dados de teste em cada teste (usar helpers)

### Boas Práticas

- Usar `data-testid` em elementos importantes da UI para seletores estáveis
- Manter testes simples e focados em um cenário principal
- Esperar elementos visíveis antes de interagir com eles
- Usar `page.waitForSelector()` para garantir que elementos estão carregados
- Capturar screenshots automaticamente em caso de falha (já configurado)
- Executar testes em múltiplos browsers para garantir compatibilidade

## Entregáveis

- [ ] Arquivo `frontend/playwright.config.js` configurado
- [ ] Arquivo `frontend/e2e/helpers.js` com funções auxiliares
- [ ] Arquivo `frontend/e2e/sale-update.spec.js` com testes E2E
- [ ] Scripts `npm run test:e2e`, `npm run test:e2e:ui`, `npm run test:e2e:report` no `package.json`
- [ ] Documentação de como executar testes E2E
- [ ] Todos os testes E2E passando

## Referências

- Tarefa 1.0: `tasks/prd-correcao-atualizacao-custos/1_task.md`
- Tarefa 2.0: `tasks/prd-correcao-atualizacao-custos/2_task.md`
- PRD: `tasks/prd-correcao-atualizacao-custos/prd.md`
- Tech Spec: `tasks/prd-correcao-atualizacao-custos/techspec.md`
- Código do frontend: `frontend/src/components/SaleForm.js`
- Código do frontend: `frontend/src/components/SaleList.js`
- Documentação do Playwright: https://playwright.dev/

## Notas para Desenvolvedor Júnior

Testes E2E são diferentes de testes unitários e de integração:

1. **Interface real**: Testes E2E interagem com a interface do usuário real, como um usuário faria
2. **Setup mais complexo**: Precisam de backend, banco e frontend todos rodando
3. **Mais lentos**: Testes E2E são os mais lentos, mas validam melhor a experiência do usuário
4. **Seletors**: Use `data-testid` em vez de classes CSS para seletores mais estáveis

**Dica importante**: Se um teste E2E falhar:

1. Verifique se todos os serviços estão rodando (backend, banco, frontend)
2. Execute o teste com modo UI (`npm run test:e2e:ui`) para ver o que está acontecendo
3. Verifique o screenshot gerado em caso de falha
4. Verifique se os elementos têm os `data-testid` corretos

**Adicionando data-testid no frontend**:

Para tornar os testes mais estáveis, adicione atributos `data-testid` nos elementos importantes:

```jsx
// Em SaleForm.js ou SaleList.js
<input
  name="custoImpressao"
  data-testid="custo-impressao-input"
  value={custoImpressao}
  onChange={handleChange}
/>

<div data-testid="lucro-liquido">
  {lucroLiquido}
</div>
```

Isso faz os testes menos propensos a quebrar quando a UI muda (classes CSS podem mudar, mas `data-testid` permanece).

Não hesite em consultar a documentação do Playwright se tiver dúvidas sobre como interagir com elementos ou esperar por condições específicas.
