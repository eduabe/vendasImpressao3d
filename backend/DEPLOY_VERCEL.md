# Deploy Backend no Vercel Serverless

Este documento descreve como fazer o deploy do backend usando Vercel Serverless Functions.

## 📋 Pré-requisitos

- Node.js instalado
- Conta no Vercel (https://vercel.com)
- CLI do Vercel instalada: `npm i -g vercel`

## 🚀 Estrutura Serverless

O backend foi adaptado para usar Vercel Serverless Functions com a seguinte estrutura:

```
backend/
├── api/
│   ├── plataformas/
│   │   ├── index.js        # POST /api/plataformas, GET /api/plataformas
│   │   └── [id].js         # GET/PUT/DELETE /api/plataformas/:id
│   └── vendas/
│       ├── index.js        # POST /api/vendas, GET /api/vendas
│       └── [id].js         # GET/PUT/DELETE /api/vendas/:id
├── src/                    # Código fonte existente
├── vercel.json             # Configuração do Vercel
└── package.json
```

## 🔧 Configuração de Variáveis de Ambiente

### 1. Variável DATABASE_URL

⚠️ **IMPORTANTE**: A variável `DATABASE_URL` deve ser configurada APÓS criar o projeto no Vercel.

#### Opção A: Usando Vercel Postgres

1. Faça login no Vercel e crie um projeto
2. No dashboard do projeto, vá em "Storage"
3. Clique em "Create Database" > "Postgres"
4. O Vercel vai criar automaticamente a variável `DATABASE_URL`

#### Opção B: Usando PostgreSQL externo (Supabase, Neon, etc.)

1. Obtenha a string de conexão do seu provedor
2. Execute o comando abaixo para adicionar a variável:
   ```bash
   vercel env add DATABASE_URL production
   ```
3. Cole a string de conexão quando solicitado
4. Exemplo de formato:
   ```
   postgresql://usuario:senha@host:porta/database
   ```

### 2. Configurar Variáveis no Vercel

**Via CLI:**

```bash
# Adicionar variável de produção
vercel env add DATABASE_URL production

# Adicionar variável de preview
vercel env add DATABASE_URL preview

# Adicionar variável de desenvolvimento
vercel env add DATABASE_URL development

# Listar todas as variáveis
vercel env ls
```

**Via Dashboard do Vercel:**

1. Acesse seu projeto no Vercel
2. Vá em Settings > Environment Variables
3. Clique em "Add New"
4. Nome: `DATABASE_URL`
5. Valor: [sua string de conexão PostgreSQL]
6. Selecione os ambientes (Production, Preview, Development)
7. Clique em "Save"

## 📦 Deploy no Vercel

### Deploy de Desenvolvimento

```bash
# Navegue até a pasta backend
cd backend

# Deploy para preview
vercel
```

### Deploy de Produção

```bash
# Deploy para produção
vercel --prod

# Ou usando o script do package.json
npm run deploy
```

### Primeiro Deploy

```bash
# 1. Faça login no Vercel
vercel login

# 2. Navegue até a pasta backend
cd backend

# 3. Inicialize o projeto
vercel

# 4. Responda às perguntas:
#    - Link to existing project? No
#    - Project name: calculadora-ganhos-backend
#    - Override settings? No

# 5. Configure as variáveis de ambiente
vercel env add DATABASE_URL production

# 6. Faça o deploy de produção
vercel --prod
```

## 🗄️ Criar Tabelas no Banco de Dados

Antes de usar a aplicação, você precisa criar as tabelas:

### Opção 1: Via Vercel Postgres

Se estiver usando Vercel Postgres:

1. Acesse o dashboard do Vercel
2. Vá para Storage > Postgres
3. Use o "Query Editor" ou "Seed" para executar o SQL

### Opção 2: Via psql ou ferramenta de cliente

```bash
# Conecte ao seu PostgreSQL
psql $DATABASE_URL

# Execute o script de criação
\i backend/database/create_tables.sql
```

### Opção 3: Via API usando Vercel Functions

Você pode criar um endpoint temporário para executar migrations:

```bash
# Crie um arquivo api/setup.js que executa o create_tables.sql
# Faça deploy e chame o endpoint
curl https://seu-projec-vercel.vercel.app/api/setup
```

## 🔄 Atualizar Frontend

Após o deploy, atualize a URL da API no frontend:

### Arquivo: `frontend/src/services/api.js`

```javascript
const API_BASE_URL = "https://seu-projec-vercel.vercel.app/api";
```

Ou use variáveis de ambiente no Vercel:

```javascript
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://localhost:3001/api";
```

## 🧪 Testar Localmente com Vercel

Você pode testar as serverless functions localmente:

```bash
cd backend
vercel dev
```

Isso vai rodar as funções serverless em `http://localhost:3000`

## 📊 Monitoramento

### Logs no Vercel

```bash
# Ver logs em tempo real
vercel logs

# Ver logs de produção
vercel logs --prod
```

### Métricas

Acesse o dashboard do Vercel para ver:

- Tempo de resposta das funções
- Uso de memória
- Taxa de erro
- Número de requisições

## 🔍 Debug

### Verificar Variáveis de Ambiente

```bash
# Listar todas as variáveis
vercel env ls

# Ver valor de uma variável (apenas desenvolvimento)
vercel env pull .env.local
```

### Testar Endpoints

```bash
# Health check
curl https://seu-projec-vercel.vercel.app/health

# Listar plataformas
curl https://seu-projec-vercel.vercel.app/api/plataformas

# Criar venda
curl -X POST https://seu-projec-vercel.vercel.app/api/vendas \
  -H "Content-Type: application/json" \
  -d '{
    "valorRecebido": 100,
    "custoImpressao": 30,
    "custoVenda": 5,
    "custoEnvio": 10,
    "plataformaId": "id-plataforma",
    "origem": "Instagram",
    "status": "em_producao"
  }'
```

## ⚙️ Configurações Adicionais

### Timeout e Memória

No arquivo `vercel.json`, você pode configurar:

```json
{
  "functions": {
    "api/**/*.js": {
      "memory": 1024,
      "maxDuration": 30
    }
  }
}
```

### Domínio Personalizado

1. Acesse Settings > Domains no dashboard do Vercel
2. Adicione seu domínio
3. Configure DNS conforme instruções

## 📝 Considerações Importantes

### Estado Global

As serverless functions são stateless. O estado é mantido no banco de dados.

### Conexões de Banco de Dados

O código já gerencia as conexões de forma apropriada para serverless:

- Usa conexões apropriadas
- Reutiliza conexões quando possível
- Fecha conexões corretamente

### Cold Starts

A primeira requisição pode ser mais lenta (cold start). Requisições subsequentes são mais rápidas.

## 🚨 Solução de Problemas

### Erro: "Cannot find module"

Verifique se todos os arquivos estão sendo incluídos no deploy:

```bash
# Verifique o arquivo vercel.json
# Certifique-se de que os paths estão corretos
```

### Erro: "Connection refused"

Verifique a variável `DATABASE_URL`:

```bash
vercel env ls
```

### Timeout de Função

Se as funções estiverem dando timeout:

1. Aumente `maxDuration` no `vercel.json`
2. Otimize as queries do banco de dados
3. Use caching quando apropriado

## 📚 Recursos Úteis

- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [Deploying with Vercel CLI](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/projects/environment-variables)

## ✅ Checklist de Deploy

- [ ] Fazer login no Vercel
- [ ] Configurar variável `DATABASE_URL`
- [ ] Criar tabelas no banco de dados
- [ ] Fazer deploy inicial (`vercel`)
- [ ] Testar endpoints
- [ ] Fazer deploy de produção (`vercel --prod`)
- [ ] Atualizar URL da API no frontend
- [ ] Deploy do frontend
- [ ] Testar integração completa
- [ ] Configurar domínio personalizado (opcional)
