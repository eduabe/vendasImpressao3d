# Tarefa 2.0: Implementar testes de integração do endpoint PUT /api/vendas/:id

## Visão Geral

Esta tarefa implementa testes de integração que validam que a correção implementada na Tarefa 1.0 funciona corretamente com persistência completa no banco de dados PostgreSQL. Os testes de integração conectam-se ao banco de dados real para garantir que a persistência dos dados e os cálculos de lucro funcionam corretamente em um ambiente próximo ao de produção.

## Objetivos

- Validar que os campos `custoImpressao` e `custoEnvio` são persistidos corretamente no banco PostgreSQL
- Verificar que os cálculos de lucro líquido e margem de lucro são realizados corretamente após atualização
- Garantir que a integridade dos dados é mantida durante o processo de atualização
- Validar o comportamento do endpoint em diferentes cenários de uso

## Dependências

**Tarefa 1.0 deve estar completa** - Os testes de integração dependem da correção do bug ser implementada no `SaleController`.

## Arquivos a Criar

- `backend/src/__tests__/SaleController.integration.test.js` - Testes de integração do SaleController com banco de dados

## Pré-requisitos

- Banco de dados PostgreSQL configurado e acessível
- Tabelas do banco criadas (script `backend/database/create_tables.sql` executado)
- Dados de teste: ao menos 2 plataformas de teste com taxas conhecidas
- Ambiente de teste configurado (variáveis de ambiente `DATABASE_URL` ou similar)
- Tarefa 1.0 completa com correção implementada

## Detalhamento da Implementação

### Subtarefas

#### 2.1 Configurar ambiente de testes de integração

**Descrição**: Configurar o ambiente necessário para executar testes de integração com banco de dados PostgreSQL.

**Ações**:

1. **Configurar banco de dados de teste**:
   - Usar o mesmo banco PostgreSQL do ambiente de desenvolvimento
   - Criar tabela de teste ou usar a tabela existente `vendas`
   - Garantir que há plataformas de teste disponíveis na tabela `plataformas`

2. **Configurar script de teste**:
   - Criar arquivo de configuração de teste (se necessário)
   - Configurar `jest` para suportar testes de integração
   - Adicionar script no `package.json` para rodar testes de integração

**Exemplo de configuração** (se necessário em `backend/jest.config.js`):

```javascript
module.exports = {
  // ... configuração existente
  testMatch: ["**/__tests__/**/*.integration.test.js"],
};
```

**Script em `package.json`**:

```json
{
  "scripts": {
    "test:integration": "jest --testPathPattern=\\.integration\\.test\\.js$"
  }
}
```

**Critérios de Sucesso**:

- [ ] Banco de dados PostgreSQL está configurado e acessível
- [ ] Script de teste `npm run test:integration` funciona
- [ ] Testes podem conectar ao banco e executar queries

#### 2.2 Implementar setup e teardown dos testes

**Descrição**: Implementar funções de setup (preparação) e teardown (limpeza) para cada teste de integração.

**Código de exemplo**:

```javascript
const { Pool } = require("pg");
const SaleController = require("../controllers/SaleController");
const SaleRepository = require("../repositories/SaleRepository");
const PlatformRepository = require("../repositories/PlatformRepository");
const ProfitCalculationService = require("../domain/services/ProfitCalculationService");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

let saleController;
let saleRepository;
let platformRepository;
let profitCalculationService;

beforeAll(async () => {
  // Conectar ao banco
  await pool.connect();

  // Inicializar repositories e serviços
  saleRepository = new SaleRepository(pool);
  platformRepository = new PlatformRepository(pool);
  profitCalculationService = new ProfitCalculationService();

  // Inicializar controller
  saleController = new SaleController(
    saleRepository,
    platformRepository,
    profitCalculationService,
  );
});

afterAll(async () => {
  // Fechar conexão com o banco
  await pool.end();
});

beforeEach(async () => {
  // Limpar dados de teste antes de cada teste (opcional)
  await pool.query("DELETE FROM vendas WHERE descricao LIKE $1", ["TESTE_%"]);
});

afterEach(async () => {
  // Limpar dados de teste após cada teste
  await pool.query("DELETE FROM vendas WHERE descricao LIKE $1", ["TESTE_%"]);
});
```

**Critérios de Sucesso**:

- [ ] `beforeAll` inicializa conexão com banco e dependências corretamente
- [ ] `afterAll` fecha conexão com banco
- [ ] `beforeEach` e `afterEach` limpam dados de teste
- [ ] Setup/tearDown não deixam dados residuais no banco

#### 2.3 Implementar teste de atualização completa com mudança de plataforma

**Descrição**: Teste principal que valida a persistência completa dos campos de custo quando a plataforma é alterada.

**Código do teste**:

```javascript
describe("PUT /api/vendas/:id - Atualização com mudança de plataforma", () => {
  it("deve persistir custoImpressao e custoEnvio quando plataforma é alterada", async () => {
    // SETUP: Criar venda de teste
    const plataforma1 = await platformRepository.findById(1);
    const vendaOriginal = await saleRepository.create({
      descricao: "TESTE_Venda Original",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: plataforma1.id,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Atualizar venda mudando plataforma e custos
    const plataforma2 = await platformRepository.findById(2);
    const dadosAtualizacao = {
      descricao: "TESTE_Venda Atualizada",
      valorRecebido: 100.0,
      custoImpressao: 15.0,
      custoEnvio: 25.0,
      plataformaId: plataforma2.id,
      origemVenda: "manual",
      status: "concluida",
    };

    const req = {
      params: { id: vendaOriginal.id },
      body: dadosAtualizacao,
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar persistência no banco
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada).not.toBeNull();
    expect(vendaAtualizada.descricao).toBe("TESTE_Venda Atualizada");
    expect(vendaAtualizada.custoImpressao).toBe(15.0);
    expect(vendaAtualizada.custoEnvio).toBe(25.0);
    expect(vendaAtualizada.plataformaId).toBe(plataforma2.id);
    expect(vendaAtualizada.lucroLiquido).toBeGreaterThan(0);
    expect(vendaAtualizada.margemLucro).toBeGreaterThan(0);
  });
});
```

**Critérios de Sucesso**:

- [ ] Teste cria venda original com valores conhecidos
- [ ] Teste atualiza venda mudando plataforma e custos
- [ ] Teste verifica que todos os campos foram persistidos corretamente
- [ ] Lucro líquido e margem de lucro são calculados corretamente
- [ ] Teste passa sem erros

#### 2.4 Implementar teste de atualização parcial (apenas custos)

**Descrição**: Teste que valida que apenas os campos fornecidos são atualizados, mantendo os valores existentes dos outros campos.

**Código do teste**:

```javascript
describe("PUT /api/vendas/:id - Atualização parcial", () => {
  it("deve atualizar apenas custoImpressao quando fornecido isoladamente", async () => {
    // SETUP: Criar venda de teste
    const vendaOriginal = await saleRepository.create({
      descricao: "TESTE_Venda Parcial",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: 1,
      origemVenda: "manual",
      status: "concluida",
    });

    // WHEN: Atualizar apenas custoImpressao
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 15.0,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que apenas custoImpressao mudou
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.custoImpressao).toBe(15.0);
    expect(vendaAtualizada.custoEnvio).toBe(20.0); // Permanece inalterado
    expect(vendaAtualizada.plataformaId).toBe(1); // Permanece inalterado
  });
});
```

**Critérios de Sucesso**:

- [ ] Teste cria venda original
- [ ] Teste atualiza apenas um campo de custo
- [ ] Campos não fornecidos mantêm valores originais
- [ ] Teste passa sem erros

#### 2.5 Implementar teste de cálculo correto de lucro após atualização

**Descrição**: Teste que valida que os cálculos financeiros são realizados corretamente após a atualização dos custos.

**Código do teste**:

```javascript
describe("PUT /api/vendas/:id - Cálculos financeiros", () => {
  it("deve recalcular lucroLiquido e margemLucro corretamente após atualização de custos", async () => {
    // SETUP: Criar venda com custos conhecidos
    const vendaOriginal = await saleRepository.create({
      descricao: "TESTE_Venda Calculos",
      valorRecebido: 100.0,
      custoImpressao: 10.0,
      custoEnvio: 20.0,
      plataformaId: 1, // Assumindo plataforma sem comissão ou comissão conhecida
      origemVenda: "manual",
      status: "concluida",
    });

    // Registrar valores originais
    const lucroOriginal = vendaOriginal.lucroLiquido;
    const margemOriginal = vendaOriginal.margemLucro;

    // WHEN: Aumentar custos
    const req = {
      params: { id: vendaOriginal.id },
      body: {
        custoImpressao: 15.0, // Aumento de 5.0
        custoEnvio: 25.0, // Aumento de 5.0
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    // THEN: Verificar que lucro diminuiu e margem foi recalculada
    const vendaAtualizada = await saleRepository.findById(vendaOriginal.id);

    expect(vendaAtualizada.lucroLiquido).toBeLessThan(lucroOriginal);
    expect(vendaAtualizada.margemLucro).toBeLessThan(margemOriginal);

    // Cálculo esperado: 100 - 15 - 25 - custo_plataforma = novo_lucro
    const novoCustoTotal = 15.0 + 25.0;
    const lucroEsperado =
      100.0 - novoCustoTotal - vendaAtualizada.custoVendaPlataforma;
    expect(vendaAtualizada.lucroLiquido).toBeCloseTo(lucroEsperado, 2);
  });
});
```

**Critérios de Sucesso**:

- [ ] Teste cria venda e registra valores originais
- [ ] Teste aumenta custos da venda
- [ ] Lucro líquido diminui proporcionalmente ao aumento de custos
- [ ] Margem de lucro é recalculada corretamente
- [ ] Teste passa sem erros

#### 2.6 Implementar teste de cenário de erro (venda não encontrada)

**Descrição**: Teste que valida o comportamento do endpoint quando tenta atualizar uma venda que não existe.

**Código do teste**:

```javascript
describe("PUT /api/vendas/:id - Cenários de erro", () => {
  it("deve retornar 404 quando venda não é encontrada", async () => {
    const req = {
      params: { id: 999999 }, // ID inexistente
      body: {
        custoImpressao: 15.0,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await saleController.update(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        mensagem: expect.stringContaining("não encontrada"),
      }),
    );
  });
});
```

**Critérios de Sucesso**:

- [ ] Teste tenta atualizar venda inexistente
- [ ] Endpoint retorna status 404
- [ ] Mensagem de erro apropriada é retornada
- [ ] Teste passa sem erros

## Testes

### Testes de Integração

**Arquivo**: `backend/src/__tests__/SaleController.integration.test.js`

**Cobertura esperada**: Validação completa do fluxo de atualização com banco de dados real

**Como executar**:

```bash
cd backend
npm run test:integration
```

**Critérios de sucesso dos testes**:

- [ ] Todos os testes de integração passam
- [ ] Nenhum dado residual fica no banco após execução dos testes
- [ ] Testes são isolados e não dependem da ordem de execução
- [ ] Conexão com banco é gerenciada corretamente (abre e fecha)

## Critérios de Aceite

### Funcionais

- [ ] Campos `custoImpressao` e `custoEnvio` são persistidos corretamente no PostgreSQL
- [ ] Atualizações parciais funcionam corretamente (apenas campos fornecidos são alterados)
- [ ] Lucro líquido e margem de lucro são recalculados corretamente após atualização
- [ ] Endpoint retorna erro 404 para vendas inexistentes
- [ ] Atualizações são atômicas (ou tudo é salvo ou nada é salvo)

### Técnicos

- [ ] Testes conectam ao banco PostgreSQL real
- [ ] Setup e teardown são implementados corretamente
- [ ] Dados de teste são limpos após cada teste
- [ ] Testes são determinísticos (mesmo resultado em múltiplas execuções)
- [ ] Testes são rápidos (< 2 segundos por teste)

### Performance

- [ ] Tempo total de execução dos testes de integração < 10 segundos
- [ ] Cada teste individual executa em < 2 segundos
- [ ] Não há vazamento de conexões com o banco

## Pontos de Atenção

### Riscos

1. **Dependência do banco de dados**: Testes falham se banco não estiver disponível
2. **Dados residuais**: Testes podem deixar dados no banco se teardown falhar
3. **Isolamento entre testes**: Testes podem interferir uns nos outros se não limparem dados

### Mitigações

1. Verificar conexão com banco antes de executar testes
2. Implementar `afterEach` robusto que garante limpeza de dados
3. Usar identificadores únicos para dados de teste (ex: prefixo "TESTE\_")

### Boas Práticas

- Usar transações do banco para rollback automático (opcional, mas recomendado)
- Limpar dados de teste prefixando com padrão identificável (ex: "TESTE\_")
- Não depender de dados específicos no banco (criar dados necessários no setup)
- Testar tanto cenários de sucesso quanto de erro
- Manter testes simples e focados

## Entregáveis

- [ ] Arquivo `backend/src/__tests__/SaleController.integration.test.js`
- [ ] Script `npm run test:integration` configurado no `package.json`
- [ ] Documentação de como configurar banco para testes (se necessário)
- [ ] Todos os testes de integração passando

## Referências

- Tarefa 1.0: `tasks/prd-correcao-atualizacao-custos/1_task.md`
- PRD: `tasks/prd-correcao-atualizacao-custos/prd.md`
- Tech Spec: `tasks/prd-correcao-atualizacao-custos/techspec.md`
- Código do SaleController: `backend/src/controllers/SaleController.js`
- Exemplo de testes unitários: `backend/src/__tests__/ProfitCalculationService.test.js`
- Schema do banco: `backend/database/create_tables.sql`

## Notas para Desenvolvedor Júnior

Testes de integração são diferentes de testes unitários:

1. **Banco de dados real**: Diferente de mocks, testes de integração usam o banco PostgreSQL real
2. **Setup mais complexo**: É preciso conectar ao banco e criar dados de teste antes de cada teste
3. **Limpeza obrigatória**: Sempre limpe os dados após cada teste para não poluir o banco
4. **Mais lentos**: Testes de integração são mais lentos que unitários, mas validam melhor o sistema

**Dica importante**: Se um teste de integração falhar, verifique primeiro:

- O banco de dados está rodando?
- A tabela `vendas` existe?
- Há pelo menos 2 plataformas na tabela `plataformas`?
- O teardown está limpando os dados corretamente?

Não hesite em consultar a documentação do `pg` (biblioteca do PostgreSQL para Node.js) se tiver dúvidas sobre como conectar ou executar queries.
