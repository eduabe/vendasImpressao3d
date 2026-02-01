# Correção de Caminhos de Importação para Vercel Serverless

## Problema

Ao fazer deploy do backend no Vercel Serverless, ocorria o erro:

```
Cannot find module '../src/database/connection'
Require stack:
- /var/task/api/vendas/index.js
```

## Causa

Os arquivos de API serverless localizados em `api/vendas/` e `api/plataformas/` estavam usando caminhos relativos incorretos. Eles usavam `../src/` quando deveriam usar `../../src/` porque precisam subir dois níveis de diretório para chegar na raiz do projeto.

## Arquivos Corrigidos

### 1. api/vendas/index.js

**Antes:**

```javascript
const { query } = require("../src/database/connection");
const PlatformRepository = require("../src/repositories/PlatformRepository");
const SaleRepository = require("../src/repositories/SaleRepository");
const SaleController = require("../src/controllers/SaleController");
```

**Depois:**

```javascript
const { query } = require("../../src/database/connection");
const PlatformRepository = require("../../src/repositories/PlatformRepository");
const SaleRepository = require("../../src/repositories/SaleRepository");
const SaleController = require("../../src/controllers/SaleController");
```

### 2. api/vendas/[id].js

**Antes:**

```javascript
const { query } = require("../src/database/connection");
const PlatformRepository = require("../src/repositories/PlatformRepository");
const SaleRepository = require("../src/repositories/SaleRepository");
const SaleController = require("../src/controllers/SaleController");
```

**Depois:**

```javascript
const { query } = require("../../src/database/connection");
const PlatformRepository = require("../../src/repositories/PlatformRepository");
const SaleRepository = require("../../src/repositories/SaleRepository");
const SaleController = require("../../src/controllers/SaleController");
```

### 3. api/plataformas/index.js

**Antes:**

```javascript
const { query } = require("../src/database/connection");
const PlatformRepository = require("../src/repositories/PlatformRepository");
const PlatformController = require("../src/controllers/PlatformController");
```

**Depois:**

```javascript
const { query } = require("../../src/database/connection");
const PlatformRepository = require("../../src/repositories/PlatformRepository");
const PlatformController = require("../../src/controllers/PlatformController");
```

### 4. api/plataformas/[id].js

**Antes:**

```javascript
const { query } = require("../src/database/connection");
const PlatformRepository = require("../src/repositories/PlatformRepository");
const PlatformController = require("../src/controllers/PlatformController");
```

**Depois:**

```javascript
const { query } = require("../../src/database/connection");
const PlatformRepository = require("../../src/repositories/PlatformRepository");
const PlatformController = require("../../src/controllers/PlatformController");
```

## Estrutura de Diretórios

```
calculadora-ganhos/
├── api/                    # Funções serverless do Vercel
│   ├── vendas/
│   │   ├── index.js       ← Corrigido: ../../src/...
│   │   └── [id].js        ← Corrigido: ../../src/...
│   └── plataformas/
│       ├── index.js       ← Corrigido: ../../src/...
│       └── [id].js        ← Corrigido: ../../src/...
└── src/                   # Código fonte do backend
    ├── controllers/
    ├── database/
    │   └── connection.js
    └── repositories/
```

## Verificações Realizadas

- ✅ Arquivo `src/database/connection.js` existe
- ✅ Arquivos `src/repositories/PlatformRepository.js` e `SaleRepository.js` existem
- ✅ Arquivos `src/controllers/PlatformController.js` e `SaleController.js` existem
- ✅ Todas as dependências necessárias estão em `package.json`:
  - pg (PostgreSQL)
  - cors
  - dotenv
  - express
  - joi
  - uuid

## Próximos Passos

1. Fazer commit e push das mudanças
2. O Vercel fará automaticamente o novo deploy
3. Testar os endpoints:
   - GET /api/vendas
   - POST /api/vendas
   - GET /api/plataformas
   - POST /api/plataformas

## Notas Importantes

- As variáveis de ambiente devem estar configuradas no Vercel (DATABASE_URL)
- O banco de dados PostgreSQL deve estar acessível externamente
- As tabelas serão criadas automaticamente na primeira requisição através da função `initializeDatabase()`
