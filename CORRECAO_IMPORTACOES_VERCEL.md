# Correção das Importações no Vercel

## Problema Identificado

Erro ao fazer deploy no Vercel:

```
Cannot find module '../src/database/connection'
Require stack:
- /var/task/api/vendas/index.js
```

## Causa

Os arquivos na pasta `api/` estavam usando caminhos relativos incorretos para importar os módulos do backend:

- Caminho incorreto: `../src/database/connection`
- Caminho correto: `../backend/src/database/connection`

## Arquivos Corrigidos

1. **api/vendas/index.js**
   - Corrigido: `const { query } = require('../backend/src/database/connection')`
   - Corrigido: `const PlatformRepository = require('../backend/src/repositories/PlatformRepository')`
   - Corrigido: `const SaleRepository = require('../backend/src/repositories/SaleRepository')`
   - Corrigido: `const SaleController = require('../backend/src/controllers/SaleController')`

2. **api/vendas/[id].js**
   - Mesmas correções acima

3. **api/plataformas/index.js**
   - Corrigido: `const { query } = require('../backend/src/database/connection')`
   - Corrigido: `const PlatformRepository = require('../backend/src/repositories/PlatformRepository')`
   - Corrigido: `const PlatformController = require('../backend/src/controllers/PlatformController')`

4. **api/plataformas/[id].js**
   - Mesmas correções acima

## Estrutura de Diretórios

```
calculadora-ganhos/
├── api/                    # Serverless functions para Vercel
│   ├── vendas/
│   │   ├── index.js       # Agora importa de ../backend/src/
│   │   └── [id].js
│   └── plataformas/
│       ├── index.js       # Agora importa de ../backend/src/
│       └── [id].js
├── backend/                # Código fonte do backend
│   ├── src/
│   │   ├── database/
│   │   ├── controllers/
│   │   ├── repositories/
│   │   └── ...
│   └── package.json
└── frontend/               # Aplicação React
```

## Próximos Passos

1. Commit das alterações
2. Deploy no Vercel
3. Verificação do funcionamento dos endpoints

## Data da Correção

01/02/2026
