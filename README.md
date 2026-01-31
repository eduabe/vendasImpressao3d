# 🖨️ Calculadora de Ganhos - Impressão 3D

Sistema completo para gerenciamento de vendas, cálculo de lucros e margens de uma empresa de impressão 3D.

## 📋 Funcionalidades

### Backend

- ✅ Cadastro de plataformas de venda (Shopee, Mercado Livre, etc)
- ✅ CRUD completo de vendas
- ✅ Cálculo automático de lucro líquido e margem
- ✅ Filtros avançados (status, origem, plataforma, range de datas)
- ✅ Ordenação de resultados
- ✅ API RESTful organizada
- ✅ Testes unitários com cobertura
- ✅ Pronto para integração com PostgreSQL

### Frontend

- ✅ Interface moderna e responsiva
- ✅ Dashboard com resumo financeiro
- ✅ Lista de vendas com filtros e ordenação
- ✅ Formulário de criação/edição de vendas
- ✅ Gerenciamento de plataformas
- ✅ Animações suaves (Framer Motion)
- ✅ Skeleton loading
- ✅ Notificações (Toasts)
- ✅ Design mobile-first
- ✅ Ícones de status

## 🚀 Tecnologias

### Backend

- Node.js
- Express.js
- Jest (testes)
- PostgreSQL (pronto para uso)

### Frontend

- React 18
- Tailwind CSS
- Framer Motion (animações)
- Lucide React (ícones)
- React Hot Toast (notificações)
- Axios (HTTP client)
- date-fns (formatação de datas)

## 📁 Estrutura do Projeto

```
calculadora-ganhos/
├── backend/
│   ├── src/
│   │   ├── domain/
│   │   │   ├── models/          # Modelos de domínio
│   │   │   └── services/       # Serviços de negócio
│   │   ├── repositories/          # Repositórios (camada de dados)
│   │   ├── controllers/          # Controladores da API
│   │   ├── routes/              # Rotas da API
│   │   ├── __tests__/           # Testes unitários
│   │   └── server.js           # Entry point
│   ├── database/
│   │   └── create_tables.sql     # Script de criação do banco
│   ├── package.json
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/           # Componentes React
    │   ├── services/            # Serviços de API
    │   ├── utils/               # Utilitários
    │   ├── App.js
    │   └── index.js
    ├── public/
    ├── package.json
    └── tailwind.config.js
```

## 🔧 Instalação e Configuração

### Pré-requisitos

- Node.js (v14 ou superior)
- npm ou yarn

### Backend

1. Navegue até a pasta do backend:

```bash
cd backend
```

2. Instale as dependências:

```bash
npm install
```

3. Crie o arquivo de ambiente:

```bash
cp .env.example .env
```

4. Configure as variáveis de ambiente em `.env`:

```
PORT=3001
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=calculadora_ganhos
DB_USER=postgres
DB_PASSWORD=your_password_here
DATABASE_URL=postgresql://postgres:your_password_here@localhost:5432/calculadora_ganhos
```

5. (Opcional) Configure o banco de dados PostgreSQL:

```bash
# Criar banco de dados
createdb calculadora_ganhos

# Executar script de criação das tabelas
psql -U postgres -d calculadora_ganhos -f database/create_tables.sql
```

6. Inicie o servidor:

```bash
npm run dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

1. Navegue até a pasta do frontend:

```bash
cd frontend
```

2. Instale as dependências:

```bash
npm install
```

3. Inicie o servidor de desenvolvimento:

```bash
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 🧪 Testes

### Backend

Executar testes:

```bash
cd backend
npm test
```

Executar testes com coverage:

```bash
npm test -- --coverage
```

Executar testes em modo watch:

```bash
npm run test:watch
```

## 📊 API Endpoints

### Plataformas

- `GET /api/plataformas` - Listar todas as plataformas
- `POST /api/plataformas` - Criar nova plataforma
- `GET /api/plataformas/:id` - Buscar plataforma por ID
- `PUT /api/plataformas/:id` - Atualizar plataforma
- `DELETE /api/plataformas/:id` - Excluir plataforma

### Vendas

- `GET /api/vendas` - Listar vendas (com filtros e ordenação)
  - Query params: `status`, `origemVenda`, `plataformaId`, `dataInicio`, `dataFim`, `ordenarPor`, `ordem`
- `POST /api/vendas` - Criar nova venda
- `GET /api/vendas/:id` - Buscar venda por ID
- `PUT /api/vendas/:id` - Atualizar venda
- `DELETE /api/vendas/:id` - Excluir venda

## 💾 Banco de Dados

O script `backend/database/create_tables.sql` contém:

- Criação das tabelas `plataformas` e `vendas`
- Índices para otimização de consultas
- Triggers para atualização automática de timestamps
- Função auxiliar para cálculo de lucro
- Dados de exemplo

## 🎯 Cálculo de Lucro

**Fórmula:**

```
Lucro Líquido = Valor Recebido
              - (Valor Recebido × Porcentagem Comissão / 100)
              - Taxa Fixa da Plataforma
              - Custo de Impressão
              - Custo de Envio
```

**Margem:**

```
Margem = (Lucro Líquido / Valor Recebido) × 100
```

## 📱 Responsividade

A aplicação é totalmente responsiva e funciona perfeitamente em:

- Desktop
- Tablet
- Mobile

## 🎨 Interface

- Design moderno com Tailwind CSS
- Animações suaves com Framer Motion
- Feedback visual em todas as ações (toasts)
- Skeleton loading para melhor UX
- Ícones intuitivos para status de vendas
- Cores diferenciadas para lucros positivos/negativos

## 🔒 Clean Code

O projeto segue princípios de Clean Code:

- Separação de responsabilidades
- SOLID principles
- DRY (Don't Repeat Yourself)
- Nomes descritivos
- Comentários em português
- Código legível e maintainable

## 📝 Notas Importantes

- O backend atual usa repositórios em memória, pronto para migração para PostgreSQL
- Todos os testes unitários focam na lógica de negócio (cálculo de lucro)
- A interface é 100% em português brasileiro
- Todas as validações são feitas tanto no frontend quanto no backend
- O cálculo de lucro é feito automaticamente pelo backend

## 🚧 Próximos Passos (Sugestões)

- [ ] Implementar autenticação
- [ ] Adicionar gráficos de vendas
- [ ] Exportar dados para Excel/CSV
- [ ] Adicionar notificações push
- [ ] Implementar backup de dados
- [ ] Adicionar suporte multi-idioma
- [ ] Criar dashboard analytics avançado

## 👨‍💻 Desenvolvido por

Sistema desenvolvido como solução completa para gerenciamento de vendas de impressão 3D.

## 📄 Licença

Este projeto é open source e está disponível para uso e modificação.
