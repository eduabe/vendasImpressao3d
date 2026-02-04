# Documento de Requisitos de Produto (PRD) - Correção de Atualização de Custos em Vendas

## Visão Geral

Este PRD documenta a correção de um bug crítico no endpoint de atualização de vendas (`PUT /api/vendas/:id`) da Calculadora de Ganhos. O problema ocorre quando um usuário atualiza uma venda existente e altera os campos `custoImpressao` e `custoEnvio`: embora o sistema calcule corretamente o lucro líquido com base nos novos valores, esses campos não são persistidos no banco de dados. Isso resulta em dados inconsistentes e cálculos incorretos em consultas subsequentes.

O sistema é uma calculadora de ganhos para vendas de impressão 3D que gerencia plataformas de venda, custos operacionais e lucratividade. A correção deste bug é essencial para garantir a integridade dos dados financeiros e a confiabilidade dos relatórios de lucratividade.

## Objetivos

- **Corrigir o bug de persistência**: Garantir que os campos `custoImpressao` e `custoEnvio` sejam atualizados no banco de dados quando fornecidos na requisição PUT
- **Manter consistência de cálculos**: Assegurar que o lucro líquido e margem de lucro sejam recalculados corretamente quando os custos são alterados
- **Preservar funcionalidade existente**: Não impactar outras funcionalidades do endpoint ou outros endpoints da API
- **Garantir compatibilidade backward**: Manter o contrato da API atual sem alterações no formato de requisição/resposta

## Histórias de Usuário

### História de Usuário 1

**Como** usuário do sistema de cálculo de lucros,  
**quero** poder editar os custos de impressão e envio de uma venda existente,  
**para que** os cálculos de lucro líquido e margem de lucro reflitam os valores reais e meus relatórios financeiros sejam precisos.

**Critérios de Aceite:**

- Posso atualizar o campo `custoImpressao` enviando o valor no corpo da requisição PUT
- Posso atualizar o campo `custoEnvio` enviando o valor no corpo da requisição PUT
- Ao atualizar estes campos, o lucro líquido é recalculado automaticamente
- Os valores atualizados são persistidos corretamente no banco de dados
- Posso consultar a venda novamente e ver os valores atualizados

### História de Usuário 2

**Como** usuário do sistema,  
**quero** que ao alterar a plataforma de uma venda e fornecer novos custos, todos os campos sejam atualizados corretamente,  
**para que** a migração entre plataformas mantenha a integridade dos dados financeiros.

**Critérios de Aceite:**

- Ao mudar de plataforma e fornecer novos custos, todos os campos são atualizados
- O sistema usa os novos custos para recalcular as comissões da nova plataforma
- O lucro líquido e margem de lucro são recalculados com base nos novos valores
- A transação é atômica (ou tudo é atualizado ou nada é atualizado)

## Funcionalidades Principais

### Correção do Endpoint PUT /api/vendas/:id

Esta funcionalidade corrige o bug no método de atualização de vendas, garantindo que os campos de custo sejam persistidos corretamente.

**Por que é importante:** Sem esta correção, os usuários não podem atualizar corretamente os custos de uma venda após sua criação, resultando em dados financeiros imprecisos e relatórios incorretos.

**Como funciona em alto nível:** O endpoint já recebe os campos `custoImpressao` e `custoEnvio` no corpo da requisição e usa esses valores para recalcular o lucro líquido. A correção consiste em garantir que esses campos também sejam incluídos no objeto de atualização enviado para o banco de dados.

**Requisitos Funcionais:**

1. **FR-01**: Quando o endpoint PUT `/api/vendas/:id` recebe uma requisição com o campo `custoImpressao` no corpo, este campo deve ser persistido no banco de dados
2. **FR-02**: Quando o endpoint PUT `/api/vendas/:id` recebe uma requisição com o campo `custoEnvio` no corpo, este campo deve ser persistido no banco de dados
3. **FR-03**: Ao atualizar `custoImpressao` ou `custoEnvio`, o sistema deve recalcular automaticamente os campos `lucroLiquido` e `margemLucro`
4. **FR-04**: Quando a plataforma é alterada e novos custos são fornecidos, todos os campos (custos e plataforma) devem ser atualizados em uma única transação
5. **FR-05**: Quando a plataforma não é alterada, a atualização dos custos deve usar a plataforma existente para recalcular as comissões
6. **FR-06**: O endpoint deve retornar status 200 com a venda atualizada quando a operação for bem-sucedida
7. **FR-07**: O endpoint deve retornar status 404 quando a venda não for encontrada
8. **FR-08**: O endpoint deve retornar status 500 com mensagem de erro quando ocorrer uma exceção não tratada

## Experiência do Usuário

### Personas de Usuário

**Usuário Primário:** Gerente de vendas de impressão 3D que utiliza o sistema para acompanhar a lucratividade de vendas em diferentes plataformas e precisa manter registros financeiros precisos.

### Fluxo Principal do Usuário

1. Usuário acessa a lista de vendas no sistema
2. Usuário seleciona uma venda existente para edição
3. Usuário altera o valor de `custoImpressao` (ex: de 15.00 para 20.00)
4. Usuário altera o valor de `custoEnvio` (ex: de 25.00 para 30.00)
5. Usuário clica em "Salvar alterações"
6. Sistema envia requisição PUT para `/api/vendas/:id` com os novos valores
7. Sistema recalcula o lucro líquido e margem de lucro com base nos novos custos
8. Sistema atualiza todos os campos no banco de dados
9. Sistema retorna sucesso e exibe os valores atualizados
10. Usuário visualiza a venda com os custos atualizados e o novo lucro líquido

### Ponto de Falha Atual

No fluxo atual, quando o usuário altera os custos e a plataforma simultaneamente, o sistema:

- Recebe os novos valores corretamente
- Recalcula o lucro líquido corretamente
- **MAS NÃO ATUALIZA** os campos `custoImpressao` e `custoEnvio` no banco de dados

Isso resulta em uma situação onde os cálculos estão corretos, mas os dados brutos estão desatualizados, causando inconsistência.

### Comportamento Esperado

Após a correção:

- Todos os campos fornecidos na requisição devem ser atualizados
- O lucro líquido e margem de lucro devem ser recalculados automaticamente
- A resposta da API deve refletir todos os campos atualizados
- Consultas subsequentes devem retornar os valores atualizados

### Considerações de UI/UX

A correção é puramente backend, então não há impactos diretos na interface do usuário. No entanto, a melhoria na consistência dos dados proporciona:

- Maior confiança nos relatórios financeiros
- Menor necessidade de correções manuais
- Experiência mais previsível ao editar vendas

### Requisitos de Acessibilidade

Esta correção não introduz novos requisitos de acessibilidade, pois é uma correção de backend que mantém o contrato existente da API.

## Restrições Técnicas de Alto Nível

### Integrações e Sistemas Existentes

- **Banco de Dados PostgreSQL**: O sistema deve manter compatibilidade com a estrutura atual da tabela `vendas`, que já possui as colunas `custo_impressao` e `custo_envio`
- **ProfitCalculationService**: A correção deve usar o serviço existente de cálculo de lucros sem alterar sua lógica interna
- **SaleRepository**: O método `update()` do repositório já suporta atualização dos campos de custo, não sendo necessárias alterações no repositório

### Mandatos de Conformidade

- Nenhum requisito regulatório específico para esta correção

### Metas de Performance

- A correção não deve impactar significativamente o tempo de resposta do endpoint PUT
- O tempo de execução deve permanecer abaixo de 500ms para requisições típicas

### Considerações de Dados

- **Integridade dos dados**: A atualização deve ser atômica para evitar estados inconsistentes
- **Precisão de cálculos**: Os valores monetários devem manter precisão de 2 casas decimais
- **Validação de tipos**: Os campos de custo devem ser validados como números antes de serem persistidos

### Requisitos de Tecnologia

- **Node.js**: A correção deve ser implementada em JavaScript/Node.js para consistência com o código existente
- **PostgreSQL**: Queries devem usar parâmetros preparados para evitar SQL injection
- **API REST**: Manter o contrato RESTful existente sem alterar endpoints ou formatos

## Fora de Escopo

### Funcionalidades Explicitamente Excluídas

- **Modificações em outros campos**: Esta correção foca especificamente nos campos `custoImpressao` e `custoEnvio`. Outros campos já funcionam corretamente.
- **Alterações na lógica de cálculo**: O `ProfitCalculationService` não deve ser modificado. A correção é apenas na persistência dos dados.
- **Mudanças na interface do frontend**: Esta correção é isolada no backend. Não há necessidade de alterações no frontend.
- **Adição de novos campos ou funcionalidades**: O escopo é limitado à correção do bug existente.
- **Migração de dados**: Não é necessário criar scripts de migração, pois os dados no banco estão corretos, apenas a atualização está com problemas.
- **Adição de novos testes unitários**: Embora recomendável, a criação de novos testes não está no escopo deste PRD.

### Considerações Futuras

Fora do escopo desta correção, mas potencialmente relevantes para o futuro:

- Validação adicional de valores negativos nos campos de custo
- Histórico de alterações de custos (audit trail)
- Notificações de alerta quando custos excederem determinados limites
- Dashboard comparativo de custos ao longo do tempo

### Limitações

Esta correção assume que:

- A estrutura do banco de dados está correta e não necessita de migrações
- O problema está isolado no método `update()` do `SaleController`
- Não há outras partes do sistema que apresentam o mesmo problema

Riscos de implementação técnica serão detalhados na Especificação Técnica (Tech Spec).
