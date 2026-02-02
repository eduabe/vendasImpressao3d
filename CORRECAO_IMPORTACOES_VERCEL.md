# Correção das Importações no Vercel
 
## Problema Identificado

Erro ao fazer deploy no Vercel:

```
Cannot find module '../src/database/connection'
Require stack:
- /var/task/api/vendas/index.js
```

## Causa Raiz

O projeto tem uma estrutura de diretórios duplicada:

- `src/` - Código fonte na raiz
- `backend/src/` - Código fonte na pasta backend

O Vercel não estava incluindo os arquivos necessários para as serverless functions.

## Estrutura de Diretórios

```
calculadora-ganhos/
├── api/                    # Serverless functions para Vercel
│   ├── vendas/
│   │   ├── index.js       # Agora importa de ../src/
│   │   └── [id].js
│   └── plataformas/
│       ├── index.js       # Agora importa de ../src/
│       └── [id].js
├── src/                   # Código fonte usado pelo Vercel
│   ├── database/
│   │   └── connection.js # Atualizado para ler SQL de backend/database/
│   ├── controllers/
│   ├── repositories/
│   └── ...
├── backend/               # Código fonte principal
│   ├── src/             # Cópia do código fonte
│   ├── database/
│   │   └── create_tables.sql
│   └── ...
├── .vercelignore         # Configuração de exclusão
└── vercel.json           # Configuração de build
```

## Arquivos Corrigidos

### 1. vercel.json

Configuração simplificada para build das serverless functions:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [...]
}
```

### 2. .vercelignore

Criado arquivo para controlar o que NÃO deve ser incluído no deploy:

```
# Dependencies
node_modules

# Testing
coverage
.nyc_output
**tests**

# Environment files
.env
.env.local
...

# Development files
backend/src/server.js
test

# Frontend
frontend/
```

**Importante:** `src/` e `backend/database/` NÃO estão no `.vercelignore`, então são incluídos automaticamente.

### 3. api/vendas/index.js

Corrigidos os imports para usar `../src/`:

```javascript
const { query } = require("../src/database/connection");
const PlatformRepository = require("../src/repositories/PlatformRepository");
const SaleRepository = require("../src/repositories/SaleRepository");
const SaleController = require("../src/controllers/SaleController");
```

### 4. api/vendas/[id].js

Mesmas correções acima.

### 5. api/plataformas/index.js

```javascript
const { query } = require("../src/database/connection");
const PlatformRepository = require("../src/repositories/PlatformRepository");
const PlatformController = require("../src/controllers/PlatformController");
```

### 6. api/plataformas/[id].js

Mesmas correções acima.

### 7. src/database/connection.js

Atualizado o caminho para ler o arquivo SQL:

```javascript
const createTablesPath = path.join(
  __dirname,
  "../../backend/database/create_tables.sql",
);
```

## Por que essa estrutura?

- **api/**: Serverless functions que são o entry point para as requisições do Vercel
- **src/**: Código fonte que é incluído automaticamente no build do Vercel (não está no .vercelignore)
- **backend/src/**: Cópia do código fonte para desenvolvimento local
- **backend/database/**: Scripts SQL que são incluídos automaticamente (não está no .vercelignore)
- **.vercelignore**: Controla o que NÃO deve ser enviado para o Vercel

## Como funciona o .vercelignore

Por padrão, o Vercel inclui todos os arquivos do projeto no deploy, EXCETO:

1. Arquivos listados no `.vercelignore`
2. Arquivos listados no `.gitignore`
3. `node_modules/` (sempre excluído)

Como `src/` e `backend/database/` NÃO estão no `.vercelignore`, eles são incluídos automaticamente.

## Próximos Passos

1. Commit das alterações
2. Deploy no Vercel
3. Verificação do funcionamento dos endpoints
4. Teste completo da aplicação

## Variáveis de Ambiente Necessárias

Certifique-se de configurar no Vercel:

- `DATABASE_URL`: String de conexão do PostgreSQL

## Data da Correção

01/02/2026
