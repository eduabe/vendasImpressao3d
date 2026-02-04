# Tarefa 1.0: Implementar correção do bug de persistência no SaleController

## Visão Geral

Esta tarefa implementa a correção principal do bug onde os campos `custoImpressao` e `custoEnvio` não são persistidos no banco de dados quando uma venda é atualizada com mudança de plataforma. A correção consiste em adicionar estes campos ao objeto `updateData` no método `update()` do `SaleController` quando a plataforma é alterada, além de adicionar logs informativos para facilitar debugging.

## Objetivos

- Corrigir o bug de persistência dos campos de custo quando a plataforma é alterada
- Adicionar logs informativos para rastrear atualizações de vendas
- Criar testes unitários abrangentes para validar a correção
- Manter compatibilidade com o contrato existente da API

## Dependências

Nenhuma. Esta é a tarefa inicial do projeto.

## Arquivos a Modificar

### Arquivo Principal

- `backend/src/controllers/SaleController.js` - Método `update()`

### Arquivos a Criar

- `backend/src/__tests__/SaleController.test.js` - Testes unitários do SaleController

## Detalhamento da Implementação

### Subtarefas

#### 1.1 Adicionar campos de custo ao objeto updateData

**Descrição**: Modificar o método `update()` do `SaleController` para incluir `custoImpressao` e `custoEnvio` no objeto `updateData` quando a plataforma é alterada.

**Localização**: Dentro do bloco `if (plataformaId && plataformaId !== sale.plataformaId)`

**Código a adicionar**:

```javascript
// Após a construção de updateData, adicionar:
if (custoImpressao !== undefined) {
  updateData.custoImpressao = custoImpressao;
}
if (custoEnvio !== undefined) {
  updateData.custoEnvio = custoEnvio;
}
```

**Critérios de Sucesso**:

- [ ] Campos `custoImpressao` e `custoEnvio` são incluídos em `updateData` quando fornecidos na requisição
- [ ] Campos são incluídos apenas quando fornecidos (não sobrescrevem com undefined)
- [ ] Código funciona dentro do bloco condicional de mudança de plataforma

#### 1.2 Adicionar logs informativos

**Descrição**: Adicionar logs antes e depois da atualização para rastrear valores antigos e novos dos campos de custo.

**Localização**: Método `update()` do `SaleController`

**Logs a adicionar**:

```javascript
// Antes da atualização (após buscar venda existente):
console.info(
  `[SaleController] Atualizando venda ${id}. Valores antigos: custoImpressao=${sale.custoImpressao}, custoEnvio=${sale.custoEnvio}`,
);

// Após atualização bem-sucedida:
console.info(
  `[SaleController] Venda ${id} atualizada. Valores novos: custoImpressao=${updateData.custoImpressao || "inalterado"}, custoEnvio=${updateData.custoEnvio || "inalterado"}, lucroLiquido=${updateData.lucroLiquido}`,
);

// Em caso de erro (já existe, mas garantir que está completo):
console.error(`[SaleController] Erro ao atualizar venda ${id}:`, error.message);
```

**Critérios de Sucesso**:

- [ ] Log INFO com valores antigos antes da atualização
- [ ] Log INFO com valores novos após atualização bem-sucedida
- [ ] Log ERROR em caso de falha
- [ ] Logs incluem identificação da venda (ID)

#### 1.3 Criar testes unitários do SaleController

**Descrição**: Implementar testes unitários abrangentes para validar o comportamento corrigido do método `update()`.

**Arquivo**: `backend/src/__tests__/SaleController.test.js`

**Cenários de Teste**:

**Teste 1.1: Atualização de plataforma com novos custos fornecidos**

- **Dado**: Uma venda existente com `custoImpressao: 10.0`, `custoEnvio: 20.0`, `plataformaId: 1`
- **Quando**: Enviar requisição PUT com `plataformaId: 2`, `custoImpressao: 15.0`, `custoEnvio: 25.0`
- **Então**: O método `update()` do repositório deve ser chamado com os novos valores de custo
- **Verificação**: `expect(saleRepository.update).toHaveBeenCalledWith(id, expect.objectContaining({ custoImpressao: 15.0, custoEnvio: 25.0 }))`

**Teste 1.2: Atualização de plataforma sem fornecer custos**

- **Dado**: Uma venda existente com `custoImpressao: 10.0`, `custoEnvio: 20.0`, `plataformaId: 1`
- **Quando**: Enviar requisição PUT apenas com `plataformaId: 2`
- **Então**: O método `update()` deve usar os valores existentes de custo (não sobrescrever)
- **Verificação**: `updateData` deve conter `custoImpressao: 10.0`, `custoEnvio: 20.0`

**Teste 1.3: Atualização sem mudar plataforma (lógica existente)**

- **Dado**: Uma venda existente com `plataformaId: 1`, `custoImpressao: 10.0`, `custoEnvio: 20.0`
- **Quando**: Enviar requisição PUT apenas com `custoImpressao: 15.0`, `custoEnvio: 25.0`
- **Então**: A lógica existente do segundo bloco deve funcionar corretamente
- **Verificação**: Valores de custo são atualizados, plataforma permanece a mesma

**Teste 1.4: Atualização parcial - apenas custoImpressao**

- **Dado**: Uma venda existente com `custoImpressao: 10.0`, `custoEnvio: 20.0`, `plataformaId: 1`
- **Quando**: Enviar requisição PUT com `plataformaId: 2`, `custoImpressao: 15.0` (sem custoEnvio)
- **Então**: Apenas `custoImpressao` é atualizado, `custoEnvio` mantém valor existente
- **Verificação**: `updateData.custoImpressao === 15.0`, `updateData.custoEnvio === 20.0`

**Teste 1.5: Atualização parcial - apenas custoEnvio**

- **Dado**: Uma venda existente com `custoImpressao: 10.0`, `custoEnvio: 20.0`, `plataformaId: 1`
- **Quando**: Enviar requisição PUT com `plataformaId: 2`, `custoEnvio: 25.0` (sem custoImpressao)
- **Então**: Apenas `custoEnvio` é atualizado, `custoImpressao` mantém valor existente
- **Verificação**: `updateData.custoImpressao === 10.0`, `updateData.custoEnvio === 25.0`

**Setup de Mocks Necessários**:

```javascript
const mockSaleRepository = {
  findById: jest.fn(),
  update: jest.fn(),
};

const mockPlatformRepository = {
  findById: jest.fn(),
};

const mockProfitCalculationService = {
  calculateAll: jest.fn(),
};
```

**Critérios de Sucesso**:

- [ ] Todos os 5 cenários de teste são implementados
- [ ] Testes validam que os campos de custo são persistidos corretamente
- [ ] Testes validam que a lógica existente não foi afetada
- [ ] Mocks são configurados corretamente para isolar o controller
- [ ] Testes passam ao executar `npm test`

## Testes

### Testes de Unidade

**Arquivo**: `backend/src/__tests__/SaleController.test.js`

**Cobertura esperada**: 100% do método `update()` do `SaleController`

**Como executar**:

```bash
cd backend
npm test -- SaleController.test.js
```

**Critérios de sucesso dos testes**:

- [ ] Todos os 5 testes passam
- [ ] Nenhum teste falha com erros inesperados
- [ ] Cobertura de código do método update() é de 100%

## Critérios de Aceite

### Funcionais

- [ ] Os campos `custoImpressao` e `custoEnvio` são persistidos no banco de dados quando fornecidos na requisição PUT com mudança de plataforma
- [ ] Os campos são persistidos corretamente mesmo quando apenas um deles é fornecido
- [ ] Os campos não são sobrescritos com `undefined` quando não fornecidos na requisição
- [ ] O lucro líquido e margem de lucro são recalculados corretamente após atualização
- [ ] A lógica existente de atualização sem mudança de plataforma continua funcionando

### Técnicos

- [ ] Logs informativos são gerados antes e depois da atualização
- [ ] Logs incluem ID da venda e valores relevantes
- [ ] Código segue o padrão existente no projeto
- [ ] Não há regressões em funcionalidades existentes
- [ ] Testes unitários cobrem todos os cenários principais

### Performance

- [ ] A correção não adiciona overhead significativo (deve ser < 5ms adicional)
- [ ] Tempo de resposta do endpoint permanece abaixo de 500ms

## Pontos de Atenção

### Riscos

1. **Regressão em funcionalidades existentes**: A alteração é muito localizada, mas testes abrangentes são essenciais
2. **Integridade de dados**: Valores inválidos (negativos, não-numéricos) podem causar problemas nos cálculos

### Mitigações

1. Implementar testes unitários para todos os cenários do método update()
2. O `ProfitCalculationService` já valida valores, então não há necessidade de validação adicional no controller

### Boas Práticas

- Manter o código o mais simples possível (evitar over-engineering)
- Seguir o estilo de código existente no projeto
- Adicionar comentários explicativos apenas onde necessário
- Garantir que os logs sejam informativos mas não excessivos

## Entregáveis

- [ ] Código corrigido no `backend/src/controllers/SaleController.js`
- [ ] Arquivo de testes `backend/src/__tests__/SaleController.test.js`
- [ ] Documentação de mudanças (se necessário)
- [ ] Todos os testes passando

## Referências

- PRD: `tasks/prd-correcao-atualizacao-custos/prd.md`
- Tech Spec: `tasks/prd-correcao-atualizacao-custos/techspec.md`
- Código existente: `backend/src/controllers/SaleController.js`
- Exemplo de testes: `backend/src/__tests__/ProfitCalculationService.test.js`

## Notas para Desenvolvedor Júnior

Esta tarefa é a base de todo o projeto. É importante entender:

1. **O problema atual**: Quando a plataforma é alterada, os campos de custo não são persistidos
2. **A solução**: Simplesmente adicionar estes campos ao objeto `updateData`
3. **Onde modificar**: Dentro do bloco `if (plataformaId && plataformaId !== sale.plataformaId)`
4. **Como testar**: Usar mocks para isolar o controller e validar que os métodos do repositório são chamados com os parâmetros corretos

Não tenha medo de perguntar se algo não estiver claro. Os testes são sua melhor ferramenta para verificar se a correção funciona corretamente.
