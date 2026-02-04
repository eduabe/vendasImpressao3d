# Plano de Desenvolvimento do PRD - Correção de Atualização de Custos

## Abordagem Seção por Seção

### 1. Visão Geral

- Descrever o problema de forma clara e concisa
- Explicar o impacto na usabilidade do sistema
- Definir o objetivo da correção

### 2. Objetivos

- Corrigir o bug que impede atualização de custoImpressao e custoEnvio
- Garantir consistência no cálculo de lucros
- Melhorar a experiência do usuário ao editar vendas

### 3. Histórias de Usuário

- Como usuário do sistema, quero poder editar os custos de impressão e envio de uma venda para que os cálculos de lucro sejam precisos
- Como usuário do sistema, espero que ao atualizar uma venda e mudar de plataforma, os custos sejam mantidos ou atualizados conforme informado

### 4. Funcionalidades Principais

- Correção do endpoint PUT /api/vendas/:id
- Atualização correta dos campos custoImpressao e custoEnvio
- Recálculo automático de lucro líquido e margem de lucro
- Requisitos funcionais numerados

### 5. Experiência do Usuário

- Descrever o fluxo de edição de venda
- Identificar o ponto de falha atual
- Definir o comportamento esperado

### 6. Restrições Técnicas

- Manter compatibilidade com API existente
- Preservar lógica de cálculo de lucros
- Não impactar outros endpoints

### 7. Fora de Escopo

- Modificações em outros campos além de custoImpressao e custoEnvio
- Alterações na lógica de cálculo de lucros (apenas corrigir persistência)
- Mudanças na interface do frontend

## Pesquisa Necessária

Não há necessidade de pesquisa externa, pois:

- As regras de negócio já estão implementadas no ProfitCalculationService
- O problema é puramente técnico (bug na persistência de dados)
- A lógica de cálculo está correta, apenas não está sendo aplicada completamente

## Premissas e Dependências

### Premissas

- O ProfitCalculationService funciona corretamente
- A estrutura do banco de dados está correta
- O problema é isolado no método update do SaleController

### Dependências

- Nenhuma dependência externa
- Correção isolada no backend
- Testes existentes podem ser reutilizados

## Checklist de Qualidade do PRD

- [ ] Problema claramente identificado
- [ ] Objetivos mensuráveis definidos
- [ ] Histórias de usuário completas
- [ ] Requisitos funcionais numerados
- [ ] Restrições técnicas apropriadas
- [ ] Fora de escopo bem delimitado
- [ ] Usando template padrão
- [ ] No máximo 2.000 palavras
