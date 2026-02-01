# Deploy do Frontend no Vercel

## Configuração

O frontend está configurado para fazer deploy automático no Vercel com as seguintes configurações:

### Arquivos de Configuração

1. **vercel.json** - Configuração do build e rotas
   - Usa `@vercel/static-build` para construir o React app
   - Diretório de saída: `build`
   - Configuração de rotas para SPA (Single Page Application)
   - Cache otimizado para arquivos estáticos

2. **.vercelignore** - Arquivos ignorados no deploy
   - node_modules
   - Arquivos de ambiente (.env)
   - Logs de desenvolvimento
   - Arquivos de IDE (.vscode, .idea)

### Conexão com Backend

O frontend já está configurado para apontar para o backend no Vercel:

```javascript
// frontend/src/services/api.js
const API_URL = "https://calculadora3d-three.vercel.app/api";
```

## URLs de Produção

- **Backend API**: https://calculadora3d-three.vercel.app/api
- **Frontend**: https://calculadora-ganhos-47x38ahmq-eduardo-nobuyuki-abes-projects.vercel.app

## Estrutura de Rotas

### API Backend

- GET/POST /api/vendas
- GET/PUT/DELETE /api/vendas/:id
- GET/POST /api/plataformas
- GET/PUT/DELETE /api/plataformas/:id

### Frontend (React Router)

- / - Dashboard principal
- Listagem de vendas
- Formulário de vendas
- Listagem de plataformas
- Formulário de plataformas

## Como Fazer Deploy

### Via CLI

```bash
cd frontend
npx vercel --yes
```

### Via GitHub (Automático)

O projeto está conectado ao repositório GitHub:
https://github.com/eduabe/vendasImpressao3d

Toda vez que você fizer push para a branch principal, o deploy será automático.

### Branches de Preview

Branches diferentes da principal geram automaticamente URLs de preview para testes.

## Variáveis de Ambiente

Não são necessárias variáveis de ambiente específicas para o frontend, pois a URL do backend já está configurada no arquivo `api.js`.

## Build Process

1. Instalação de dependências via npm
2. Execução do build: `npm run build`
3. O resultado é gerado na pasta `build/`
4. Deploy automático dos arquivos estáticos

## Troubleshooting

### Erro de CORS

Se você encontrar erros de CORS, verifique se o backend está configurado para aceitar requisições do domínio do frontend.

### API não acessível

Verifique se:

1. O backend está online
2. A URL está correta em `frontend/src/services/api.js`
3. As rotas da API correspondem às chamadas do frontend

### Build falha

Verifique o log de build no painel do Vercel para identificar problemas específicos.

## Monitoramento

- Acesse o painel do projeto: https://vercel.com/eduardo-nobuyuki-abes-projects/calculadora-ganhos
- Verifique os logs de deployment
- Monitore o desempenho e uptime
