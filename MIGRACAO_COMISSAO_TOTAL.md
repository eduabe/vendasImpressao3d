# Migração: Adicionar Comissão Total da Plataforma

## Visão Geral

Esta migração adiciona a funcionalidade de exibir o valor total da comissão da plataforma (taxa fixa + porcentagem) na lista de vendas.

## Data

2026-01-31

## Versão

2.0

## Alterações Realizadas

### 1. Banco de Dados

#### Nova Migration (para instalações existentes)

**Arquivo:** `backend/database/migration_add_comissao_total.sql`

Adiciona a coluna `comissao_plataforma_total` à tabela `vendas`:

- Tipo: `DECIMAL(10, 2)`
- Default: `0.00`
- Descrição: Valor total da comissão da plataforma (taxa fixa + porcentagem sobre valor recebido)

A migration também atualiza automaticamente os registros existentes com o cálculo correto.

#### Atualização do Script Principal (para novas instalações)

**Arquivo:** `backend/database/create_tables.sql`

- Adicionou a coluna `comissao_plataforma_total` diretamente na definição da tabela
- Atualizou os comentários da tabela para incluir a nova coluna
- Atualizou o INSERT de exemplo para incluir o valor da comissão total

### 2. Backend

#### Modelo de Venda

**Arquivo:** `backend/src/domain/models/Sale.js`

- Adicionou `margemLucro` ao construtor (já estava sendo usado mas não estava definido)
- Adicionou `comissaoPlataformaTotal` ao construtor

#### Serviço de Cálculo de Lucro

**Arquivo:** `backend/src/domain/services/ProfitCalculationService.js`

- Adicionou método `calculatePlatformCommission()` que calcula a comissão total (taxa fixa + porcentagem)
- Atualizou método `calculateAll()` para incluir `comissaoPlataformaTotal` no retorno

#### Controller de Vendas

**Arquivo:** `backend/src/controllers/SaleController.js`

- Atualizou método `create()` para incluir `comissaoPlataformaTotal` ao criar venda
- Atualizou método `update()` para incluir `comissaoPlataformaTotal` ao atualizar venda

### 3. Frontend

#### Lista de Vendas

**Arquivo:** `frontend/src/components/SaleList.js`

- Adicionou coluna "Comissão" na tabela
- A coluna exibe o valor total da comissão da plataforma
- Destaque visual em laranja (`text-orange-600`) para diferenciar de lucro
- A coluna é ordenável clicando no cabeçalho
- Usa o utilitário `formatCurrency()` para formatação

## Como Aplicar a Migração

### Para Instalações Existentes

1. **Backup do Banco de Dados** (recomendado):

```bash
pg_dump -U seu_usuario -d seu_banco > backup_antes_migracao.sql
```

2. **Executar a Migration**:

```bash
psql -U seu_usuario -d seu_banco -f backend/database/migration_add_comissao_total.sql
```

3. **Verificar a Migration**:

```sql
\d vendas
-- Deve mostrar a coluna comissao_plataforma_total
```

### Para Novas Instalações

Basta executar o script principal `create_tables.sql` que já inclui a nova coluna:

```bash
psql -U seu_usuario -d seu_banco -f backend/database/create_tables.sql
```

## Cálculo da Comissão Total

A comissão total da plataforma é calculada da seguinte forma:

```
comissao_total = taxa_fixa + (valor_recebido * porcentagem_comissao / 100)
```

**Exemplo Prático:**

- Valor recebido: R$ 150,00
- Taxa fixa da Shopee: R$ 5,00
- Porcentagem de comissão da Shopee: 12%

Cálculo:

- Comissão percentual: 150,00 × 0,12 = R$ 18,00
- Comissão total: 5,00 + 18,00 = **R$ 23,00**

## Benefícios

1. **Transparência**: Visualização clara de quanto a plataforma está cobrando
2. **Análise de Custos**: Facilita a comparação entre diferentes plataformas
3. **Tomada de Decisão**: Ajuda a decidir qual plataforma é mais vantajosa
4. **Controle Financeiro**: Melhor entendimento dos custos de operação

## Compatibilidade

- ✅ A migration usa `IF NOT EXISTS`, podendo ser executada múltiplas vezes com segurança
- ✅ Os dados existentes são automaticamente atualizados com o cálculo correto
- ✅ O sistema continua funcionando normalmente durante a migration
- ✅ Não há impacto na performance significativo

## Rollback (em caso de problemas)

Se precisar reverter a migration:

```sql
-- Remover a coluna (dados serão perdidos)
ALTER TABLE vendas DROP COLUMN IF EXISTS comissao_plataforma_total;

-- Remover índice
DROP INDEX IF EXISTS idx_vendas_comissao_plataforma;
```

## Notas Importantes

1. A migration atualiza automaticamente os registros existentes, mas é sempre bom fazer backup antes
2. A coluna tem default 0.00, então não quebra operações de insert/update que não especifiquem o valor
3. O cálculo é feito automaticamente pelo backend, não precisa ser calculado manualmente
4. Para ver os dados corretos, é necessário reiniciar o servidor backend após a migration
