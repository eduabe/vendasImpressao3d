# Especificação Técnica - Correção de Atualização de Custos em Vendas

## Resumo Executivo

Esta especificação técnica documenta a correção de um bug crítico no endpoint `PUT /api/vendas/:id` onde os campos `custoImpressao` e `custoEnvio` não são persistidos no banco de dados quando fornecidos na requisição de atualização. A correção consiste em adicionar estes campos ao objeto `updateData` no método `update()` do `SaleController` quando a plataforma é alterada, garantindo que os valores fornecidos pelo frontend sejam persistidos corretamente. A solução mantém a lógica existente de recálculo de lucro através do `ProfitCalculationService` e utiliza o padrão de repositório existente (`SaleRepository`). Serão adicionados logs específicos para debugging e recomendada uma estratégia de testes para validar a correção.

## Arquitetura do Sistema

### Visão Geral dos Componentes

**Componentes Principais Envolvidos:**

- **SaleController** (`backend/src/controllers/SaleController.js`): Controlador REST responsável por processar requisições HTTP de vendas. O método `update()` será modificado para incluir os campos de custo no objeto de atualização quando a plataforma é alterada.
- **SaleRepository** (`backend/src/repositories/SaleRepository.js`): Camada de persistência de dados que implementa o padrão Repository para acesso à tabela `vendas` no PostgreSQL. O método `update()` já suporta atualização dos campos de custo, não necessitando modificações.
- **ProfitCalculationService** (`backend/src/domain/services/ProfitCalculationService.js`): Serviço de domínio responsável pelo cálculo de lucro líquido, margem de lucro e comissão total da plataforma. Utiliza-se deste serviço existente sem modificações na sua lógica interna.
- **Sale Model** (`backend/src/domain/models/Sale.js`): Modelo de domínio que representa uma venda com todos os campos relevantes.

**Relacionamentos:**

1. `SaleController` depende de `SaleRepository` para persistência
2. `SaleController` depende de `ProfitCalculationService` para cálculos financeiros
3. `SaleRepository` acessa diretamente o banco de dados PostgreSQL

**Fluxo de Dados:**

1. Cliente envia requisição PUT para `/api/vendas/:id` com campos atualizados
2. `SaleController.update()` recebe a requisição e busca a venda existente
3. Se `plataformaId` foi alterada, busca nova plataforma e recupera taxas
4. Sistema extrai valores de `custoImpressao` e `custoEnvio` (fornecidos ou existentes)
5. `ProfitCalculationService.calculateAll()` recalcula lucro líquido e margem
6. `SaleController.update()` constrói objeto `updateData` com **todos** os campos a atualizar
7. `SaleRepository.update()` persiste as alterações no PostgreSQL
8. Sistema retorna venda atualizada ao cliente

## Design de Implementação

### Interfaces Principais

A correção não introduz novas interfaces, mas modifica o comportamento do método existente no `SaleController`:

```javascript
// Interface existente que será modificada (SaleController.update)
async update(req, res) {
  // Parâmetros:
  // req.params.id: string - ID da venda a ser atualizada
  // req.body: {
  //   descricao?: string,
  //   valorRecebido?: number,
  //   custoImpressao?: number,  // Campo que não estava sendo persistido
  //   custoEnvio?: number,      // Campo que não estava sendo persistido
  //   plataformaId?: number,
  //   origemVenda?: string,
  //   status?: string
  // }

  // Retorno:
  // res.status(200).json({
  //   mensagem: 'Venda atualizada com sucesso',
  //   dados: Sale
  // })
}
```

### Modelos de Dados

**Entidade de Domínio Sale (Existente):**

```javascript
{
  id: string,
  descricao: string | null,
  valorRecebido: number,
  custoImpressao: number,        // Campo a ser corrigido
  custoVendaPlataforma: number,
  custoEnvio: number,            // Campo a ser corrigido
  plataformaId: number,
  plataformaNome: string,
  origemVenda: string,
  status: string,
  dataCadastro: Date,
  lucroLiquido: number,
  margemLucro: number,
  comissaoPlataformaTotal: number
}
```

**Esquema de Banco de Dados (Existente - Sem Alterações):**

```sql
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    descricao TEXT,
    valor_recebido DECIMAL(10, 2) NOT NULL,
    custo_impressao DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_venda_plataforma DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    custo_envio DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    -- ... outros campos
);
```

**Tipo de Requisição (PUT /api/vendas/:id):**

```javascript
{
  descricao?: string,
  valorRecebido?: number,
  custoImpressao?: number,  // Opcional, mas se fornecido deve ser persistido
  custoEnvio?: number,      // Opcional, mas se fornecido deve ser persistido
  plataformaId?: number,
  origemVenda?: string,
  status?: string
}
```

**Tipo de Resposta:**

```javascript
{
  mensagem: string,
  dados: Sale
}
```

### Endpoints de API

**PUT /api/vendas/:id**

- **Descrição**: Atualiza uma venda existente, incluindo correção para persistir campos de custo quando a plataforma é alterada.
- **Requisição**:
  - **Parâmetros de Path**: `id` (string) - ID da venda
  - **Corpo (JSON)**: Campos opcionais para atualização (descrito acima)
- **Resposta de Sucesso**: Status 200 com venda atualizada
- **Resposta de Erro**:
  - Status 404 se venda não encontrada
  - Status 500 com mensagem de erro em caso de exceção

## Pontos de Integração

Esta correção é puramente interna e não requer integrações com serviços ou APIs externas. Todos os componentes envolvidos (`SaleController`, `SaleRepository`, `ProfitCalculationService`) fazem parte do sistema existente.

**Dependências Internas:**

- PostgreSQL como banco de dados (já configurado)
- Conexão com o banco através do módulo `backend/src/database/connection.js`

## Abordagem de Testes

### Testes Unidade

**Componentes Principais a Testar:**

1. **SaleController.update()** - Teste unitário focado na correção:
   - Cenário 1: Atualização de plataforma com novos custos fornecidos (custoImpressao e custoEnvio devem ser persistidos)
   - Cenário 2: Atualização de plataforma sem fornecer custos (usar valores existentes)
   - Cenário 3: Atualização de valores sem mudar plataforma (lógica existente não deve ser afetada)
   - Cenário 4: Atualização parcial (apenas custoImpressao, manter custoEnvio existente)
   - Cenário 5: Atualização parcial (apenas custoEnvio, manter custoImpressao existente)

**Requisitos de Mock:**

- `SaleRepository`: Mock para métodos `findById()` e `update()`
- `PlatformRepository`: Mock para método `findById()`
- `ProfitCalculationService`: Mock para método `calculateAll()`

**Exemplo de Caso de Teste Crítico:**

```javascript
test("deve persistir custoImpressao e custoEnvio quando plataforma é alterada", async () => {
  const vendaExistente = {
    id: "1",
    custoImpressao: 10.0,
    custoEnvio: 20.0,
    plataformaId: 1,
    valorRecebido: 100.0,
  };

  const req = {
    params: { id: "1" },
    body: {
      plataformaId: 2,
      custoImpressao: 15.0,
      custoEnvio: 25.0,
    },
  };

  // ... setup de mocks

  await saleController.update(req, res);

  // Verificar que update foi chamado com custoImpressao e custoEnvio
  expect(saleRepository.update).toHaveBeenCalledWith(
    "1",
    expect.objectContaining({
      custoImpressao: 15.0,
      custoEnvio: 25.0,
    }),
  );
});
```

### Testes de Integração

**Componentes a Testar Juntos:**

1. **SaleController + SaleRepository + Database**:
   - Criar venda no banco
   - Atualizar venda alterando plataforma e custos
   - Consultar venda novamente para verificar persistência
   - Verificar que todos os campos (incluindo custos) foram atualizados corretamente

**Requisitos de Dados de Teste:**

- Banco de dados de teste PostgreSQL (pode ser o mesmo de desenvolvimento com dados de teste isolados)
- Platform de teste com taxas conhecidas
- Venda de teste com valores conhecidos

### Testes de E2E

**Teste End-to-End usando Playwright:**

1. **Fluxo Principal**:
   - Carregar aplicação frontend
   - Navegar para lista de vendas
   - Selecionar uma venda existente
   - Editar venda alterando plataforma e custos
   - Salvar alterações
   - Verificar que venda foi atualizada corretamente na lista

2. **Validação de Persistência**:
   - Após editar venda, recarregar página
   - Abrir novamente a venda editada
   - Verificar que os valores de custo persistiram corretamente

## Sequenciamento de Desenvolvimento

### Ordem de Construção

1. **Implementação da Correção no SaleController** (Prioridade Crítica)
   - **Por que primeiro**: É a única modificação de código necessária. O repositório e serviço de cálculo já funcionam corretamente.
   - **Alterações**: Adicionar duas linhas no bloco `if (plataformaId && plataformaId !== sale.plataformaId)` para incluir `custoImpressao` e `custoEnvio` no objeto `updateData` quando fornecidos na requisição.
   - **Adicionar Logs**: Incluir logs informativos antes e depois da atualização para debugging.

2. **Implementação de Logs** (Simultâneo com passo 1)
   - Adicionar log de nível `info` com valores antigos e novos dos campos de custo
   - Adicionar log de nível `debug` para rastrear fluxo de execução

3. **Testes Unidade** (Recomendado)
   - Criar testes para validar o comportamento corrigido do método `update()`
   - Cobrir cenários de atualização com e sem mudança de plataforma

4. **Testes de Integração** (Recomendado)
   - Validar persistência completa no banco de dados
   - Verificar cálculos corretos de lucro após atualização

5. **Testes E2E** (Opcional, mas recomendado)
   - Validar fluxo completo do usuário no frontend

### Dependências Técnicas

**Sem dependências bloqueantes**. A correção pode ser implementada imediatamente com:

- Ambiente de desenvolvimento Node.js configurado
- Acesso ao banco de dados PostgreSQL
- Testes existentes funcionando (opcional)

## Monitoramento e Observabilidade

### Métricas a Expor

Não são necessárias novas métricas Prometheus específicas para esta correção, pois a funcionalidade já existia parcialmente. No entanto, os logs adicionais permitirão rastrear:

- Quantidade de atualizações de vendas com mudança de plataforma
- Frequência de atualizações de campos de custo
- Taxas de sucesso/falha em atualizações

### Logs Principais e Níveis de Log

**Logs a Serem Adicionados no SaleController.update():**

```javascript
// Nível: INFO
// Log antes da atualização com valores antigos
console.info(
  `[SaleController] Atualizando venda ${id}. Valores antigos: custoImpressao=${sale.custoImpressao}, custoEnvio=${sale.custoEnvio}`,
);

// Nível: INFO
// Log após atualização bem-sucedida com novos valores
console.info(
  `[SaleController] Venda ${id} atualizada. Valores novos: custoImpressao=${updateData.custoImpressao || "inalterado"}, custoEnvio=${updateData.custoEnvio || "inalterado"}, lucroLiquido=${updateData.lucroLiquido}`,
);

// Nível: ERROR
// Log em caso de falha na atualização
console.error(`[SaleController] Erro ao atualizar venda ${id}:`, error.message);
```

**Níveis de Log:**

- **INFO**: Para ações importantes (atualizações bem-sucedidas)
- **ERROR**: Para erros e exceções
- **DEBUG**: Para rastreamento detalhado do fluxo de execução (opcional)

### Integração com Dashboards Grafana

Não são necessárias modificações em dashboards existentes, pois esta é uma correção de bug que não altera métricas de negócio. Os logs adicionais podem ser visualizados através de ferramentas de log aggregation (se disponível).

## Considerações Técnicas

### Decisões Principais

**1. Abordagem de Correção:**

- **Decisão**: Adicionar os campos `custoImpressao` e `custoEnvio` ao objeto `updateData` dentro do bloco `if (plataformaId && plataformaId !== sale.plataformaId)` quando os valores são fornecidos na requisição.
- **Justificativa**: Esta é a solução mais simples e direta, mantendo a lógica existente do segundo bloco (quando plataforma não muda) e minimizando o risco de introduzir novos bugs.
- **Trade-offs**: Alternativa seria refatorar todo o método para um código mais DRY, mas isso aumentaria significativamente o risco de regressão em funcionalidades que funcionam corretamente.
- **Alternativas Rejeitadas**:
  - Refatoração completa do método update() - muito arriscado para uma correção simples
  - Criar novo endpoint PATCH para atualizações parciais - mudança de contrato da API não necessária
  - Mover lógica para o repositório - violaria separação de responsabilidades (repositório não deve conter lógica de negócio)

**2. Validação de Dados:**

- **Decisão**: Não adicionar validação para valores negativos nos campos de custo no endpoint PUT.
- **Justificativa**: O PRD especifica explicitamente que não é necessário validar valores negativos. O `ProfitCalculationService` já valida que os valores sejam números não-negativos antes de realizar cálculos.
- **Alternativas Rejeitadas**: Adicionar validação no controller seria redundante e aumentaria complexidade desnecessariamente.

**3. Logs de Debugging:**

- **Decisão**: Adicionar logs informativos antes e depois da atualização, mostrando valores antigos e novos dos campos de custo.
- **Justificativa**: Facilita debugging em produção e permite rastrear quando os campos são atualizados corretamente após a correção.
- **Trade-offs**: Logs adicionais aumentam volume de dados, mas o benefício em termos de observabilidade supera este custo.

**4. Testes:**

- **Decisão**: Incluir recomendações de testes (unidade, integração e E2E) na Tech Spec, mesmo que implementação não seja estritamente obrigatória.
- **Justificativa**: Testes são essenciais para garantir que a correção funciona corretamente e não introduz regressões. O PRD menciona que adição de testes está fora do escopo, mas recomendações de teste ajudam na implementação.
- **Alternativas Rejeitadas**: Não recomendar testes aumentaria o risco de regressão e dificultaria validação da correção.

### Riscos Conhecidos

**1. Regressão em Funcionalidades Existentes:**

- **Risco**: Alterações no método `update()` podem afetar outras funcionalidades que dependem deste método.
- **Probabilidade**: Baixa - a alteração é muito localizada (adicionar duas linhas de código).
- **Mitigação**: Implementar testes unitários para todos os cenários existentes do método update(), não apenas para a correção.

**2. Integridade de Dados:**

- **Risco**: Se houver erro no cálculo ou persistência, dados inconsistentes podem ser salvos no banco.
- **Probabilidade**: Muito baixa - a lógica de cálculo já existe e funciona corretamente; estamos apenas garantindo persistência dos dados.
- **Mitigação**: Testes de integração que verificam persistência completa no banco e validam cálculos de lucro.

**3. Performance:**

- **Risco**: Consulta adicional ao banco para buscar plataforma quando valores são alterados (já existe, mas pode ser otimizada).
- **Probabilidade**: Nula - nenhuma nova consulta está sendo adicionada.
- **Mitigação**: Não aplicável.

**4. Compatibilidade Backward:**

- **Risco**: Mudanças no comportamento podem quebrar clientes existentes que dependem do bug.
- **Probabilidade**: Nenhuma - estamos corrigindo um bug, não mudando o contrato da API. Clientes que enviavam estes campos esperavam que fossem persistidos, e agora serão.
- **Mitigação**: Não aplicável.

**Desafios Potenciais:**

- Nenhum desafio significativo identificado. A correção é simples e bem-localizada.

**Áreas Precisando Pesquisa:**

- Nenhuma área específica. A arquitetura atual é clara e o problema bem-definido.

### Conformidade com Padrões

Não há arquivo de regras em `.claude/rules` neste projeto, então não é possível mapear decisões para padrões específicos do projeto. No entanto, a correção segue as seguintes boas práticas de desenvolvimento:

- **Separação de Responsabilidades**: Controller mantém responsabilidade por coordenar a lógica, repositório por persistência, e serviço de domínio por cálculos.
- **Princípio do Mínimo Surpresa**: A correção faz o que os usuários esperam (persistir campos fornecidos).
- **Manutenção de Contrato da API**: Não alteramos o formato de requisição/resposta, apenas corrigimos o comportamento.
- **Observabilidade**: Adição de logs para facilitar debugging e monitoramento.
- **Testabilidade**: Código é testável através de mocks de dependências.

### Arquivos Relevantes e Dependentes

**Arquivos a Serem Modificados:**

- `backend/src/controllers/SaleController.js` - Único arquivo que precisa de modificação

**Arquivos Dependentes (que chamam SaleController.update):**

- `backend/api/vendas/[id].js` - Handler da API Vercel que chama o controller

**Arquivos Utilizados pela Correção (sem modificações):**

- `backend/src/repositories/SaleRepository.js` - Método update() já funciona corretamente
- `backend/src/repositories/PlatformRepository.js` - Método findById() já funciona corretamente
- `backend/src/domain/services/ProfitCalculationService.js` - Método calculateAll() já funciona corretamente
- `backend/src/domain/models/Sale.js` - Modelo de domínio já está correto
- `backend/src/database/connection.js` - Conexão com banco já está configurada

**Arquivos de Configuração (sem modificações):**

- `backend/package.json` - Dependências do projeto
- `backend/database/create_tables.sql` - Schema do banco de dados (já possui colunas corretas)
- `backend/src/routes/saleRoutes.js` - Rotas da API (já configuradas corretamente)

**Arquivos de Teste:**

- `backend/src/__tests__/ProfitCalculationService.test.js` - Testes existentes do serviço (pode servir de referência)
- Recomendado criar: `backend/src/__tests__/SaleController.test.js` - Testes do controller (incluindo correção)
