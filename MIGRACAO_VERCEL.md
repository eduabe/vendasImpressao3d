# Migração para Vercel Serverless Functions

## 📋 Resumo

O backend foi preparado para usar Vercel Serverless Functions, permitindo deploy serverless sem a necessidade de manter um servidor Express rodando continuamente.

## 📁 Estrutura Criada

```
backend/
├── api/                           # NOVO: Serverless Functions
│   ├── plataformas/
│   │   ├── index.js              # POST/GET /api/plataformas
│   │   └── [id].js               # GET/PUT/DELETE /api/plataformas/:id
│   └── vendas/
│       ├── index.js              # POST/GET /api/vendas
│       └── [id].js               # GET/PUT/DELETE /api/vendas/:id
├── .vercelignore                  # NOVO: Arquivos ignorados no deploy
├── .gitignore                     # NOVO: Arquivos ignorados no git
├── vercel.json                    # NOVO: Configuração do Vercel
├── package.json                   # ATUALIZADO: Scripts de deploy
└── DEPLOY_VERCEL.md               # NOVO: Documentação de deploy
```

## 🔧 Alterações Realizadas

### 1. Serverless Functions (`api/`)

Foram criadas 4 funções serverless que substituem as rotas Express:

- **`api/plataformas/index.js`**
  - POST /api/plataformas
  - GET /api/plataformas

- **`api/plataformas/[id].js`**
  - GET /api/plataformas/:id
  - PUT /api/plataformas/:id
  - DELETE /api/plataformas/:id

- **`api/vendas/index.js`**
  - POST /api/vendas
  - GET /api/vendas

- **`api/vendas/[id].js`**
  - GET /api/vendas/:id
  - PUT /api/vendas/:id
  - DELETE /api/vendas/:id

Cada função:

- Gerencia CORS automaticamente
- Inicializa controllers e repositórios de forma lazy (apenas na primeira execução)
- Parse do body JSON automaticamente
- Tratamento de erros centralizado
- Mantém compatibilidade total com os controllers existentes

### 2. Configuração Vercel (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/**/*.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [...],
  "env": {
    "DATABASE_URL": "@database_url",
    "NODE_ENV": "production"
  }
}
```

### 3. Scripts de Deploy (`package.json`)

Adicionados scripts:

- `vercel-build`: Build command para Vercel
- `deploy`: Deploy para produção

### 4. Arquivos de Ignorar

**`.vercelignore`**: Arquivos que não devem ser enviados para o Vercel

- node_modules
- arquivos de teste
- arquivos de desenvolvimento local
- arquivos de banco de dados local

**`.gitignore`**: Arquivos que não devem ser versionados

- Variáveis de ambiente
- Logs
- Arquivos do Vercel (.vercel)
- Bancos de dados locais

### 5. Documentação (`DEPLOY_VERCEL.md`)

Guia completo de deploy incluindo:

- Pré-requisitos
- Configuração de variáveis de ambiente
- Passo a passo de deploy
- Configuração de banco de dados
- Monitoramento e debug
- Solução de problemas
- Checklist de deploy

## ✅ Benefícios da Migração

1. **Serverless**: Sem necessidade de gerenciar servidor
2. **Auto-scaling**: Escala automaticamente com o tráfego
3. **Pay-per-use**: Paga apenas pelo que usa
4. **Zero Downtime**: Deploy sem interrupção
5. **Global CDN**: Distribuído globalmente pelo Vercel
6. **Fácil Deploy**: Comando único para deploy
7. **Preview Deployments**: Ambiente de preview automático
8. **Compatibilidade Mantida**: Código existente funciona sem alterações

## 🔄 Compatibilidade

O código fonte original (`src/`) foi mantido **intocado**, garantindo:

- ✅ Desenvolvimento local com `npm run dev` continua funcionando
- ✅ Testes com `npm test` continuam funcionando
- ✅ Controllers e Repositories não precisaram de alterações
- ✅ Lógica de negócio permanece a mesma

Apenas foi criada uma camada de adaptação para serverless nas funções da pasta `api/`.

## 🚀 Como Usar

### Desenvolvimento Local (Express)

```bash
cd backend
npm run dev
# Roda em http://localhost:3001
```

### Desenvolvimento Local com Vercel

```bash
cd backend
vercel dev
# Roda funções serverless em http://localhost:3000
```

### Deploy em Produção

```bash
cd backend
vercel --prod
# Ou
npm run deploy
```

## 📝 Próximos Passos

1. **Configurar DATABASE_URL** no Vercel
2. **Criar tabelas** no banco de dados PostgreSQL
3. **Fazer deploy inicial** de teste
4. **Atualizar frontend** com a URL da API
5. **Testar endpoints** em produção
6. **Configurar domínio personalizado** (opcional)

## 🔗 Documentação

Veja o guia completo em `backend/DEPLOY_VERCEL.md`

## 📌 Notas Importantes

- O servidor Express (`src/server.js`) continua funcionando para desenvolvimento local
- As serverless functions são uma camada adicional, não uma substituição
- Para produção, use as serverless functions via Vercel
- Para desenvolvimento local, pode usar Express ou Vercel dev
- O código fonte compartilhado evita duplicação de lógica

## ⚠️ Considerações

- **Cold Starts**: Primeira requisição pode ser mais lenta (~100-500ms)
- **Timeout**: Funções têm limite de tempo (padrão: 10s, máximo: 60s)
- **Memória**: Funções têm limite de memória (padrão: 1024MB)
- **Conexões DB**: Gerenciadas automaticamente pelo código
- **Estado Stateless**: Nenhum estado é mantido entre requisições

## 🎯 Recomendações

1. Use **Vercel Postgres** para simplificar configuração
2. Configure **alertas** no Vercel para monitorar erros
3. Use **preview deployments** para testar antes de produção
4. Configure **domínio personalizado** para profissionalismo
5. Ative **analytics** para entender uso da aplicação
