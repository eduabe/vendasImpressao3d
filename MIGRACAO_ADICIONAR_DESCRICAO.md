# Migração: Adicionar Campo Descrição

## Resumo

Adicionado campo de texto livre `descricao` para descrição do item vendido no formulário de vendas e na listagem de vendas.

## Alterações Realizadas

### Backend

1. **Modelo de Venda** (`backend/src/domain/models/Sale.js`)
   - Adicionado parâmetro `descricao` no construtor
   - Inicializado com valor padrão vazio ('')

2. **Controller de Vendas** (`backend/src/controllers/SaleController.js`)
   - Adicionado `descricao` no método `create()`
   - Adicionado `descricao` no método `update()`
   - O campo é opcional e é trimado antes de salvar

3. **Repositório** (`backend/src/repositories/SaleRepository.js`)
   - Sem alterações necessárias (repositório genérico aceita qualquer propriedade)

### Banco de Dados

4. **Script de Criação de Tabelas** (`backend/database/create_tables.sql`)
   - Adicionada coluna `descricao TEXT` na tabela `vendas`
   - Adicionado comentário explicativo

5. **Script de Migração** (`backend/database/migration_add_descricao.sql`)
   - Novo arquivo para adicionar coluna em bancos existentes
   - Executa `ALTER TABLE vendas ADD COLUMN descricao TEXT`

### Frontend

6. **Formulário de Vendas** (`frontend/src/components/SaleForm.js`)
   - Adicionado campo de texto `descricao` como primeiro campo do formulário
   - Campo é opcional com placeholder informativo
   - Usa ícone `FileText` do lucide-react
   - Área de texto (textarea) com 3 linhas

7. **Lista de Vendas** (`frontend/src/components/SaleList.js`)
   - Adicionada coluna "Descrição" como primeira coluna da tabela
   - Exibe descrição ou "Sem descrição" em itálico quando vazio
   - Largura fixa de w-64 (256px) para a coluna
   - Atualizado colspan de 9 para 10 na mensagem de "nenhuma venda encontrada"

## Como Aplicar a Migração

### Para novos bancos de dados:

Execute o script completo:

```bash
psql -U seu_usuario -d calculadora_ganhos -f backend/database/create_tables.sql
```

### Para bancos de dados existentes:

Execute apenas a migração:

```bash
psql -U seu_usuario -d calculadora_ganhos -f backend/database/migration_add_descricao.sql
```

## Características do Campo Descrição

- **Tipo**: TEXT (permite texto longo)
- **Obrigatório**: Não (opcional)
- **Posição no formulário**: Primeiro campo
- **Posição na listagem**: Primeira coluna
- **Validação**: Trimado antes de salvar, valor padrão vazio
- **Interface**: Textarea com 3 linhas, placeholder informativo

## Compatibilidade

- Mantém total compatibilidade com vendas existentes (valor padrão vazio)
- Backend e frontend prontos para PostgreSQL
- Não afeta cálculos de lucro ou margem
