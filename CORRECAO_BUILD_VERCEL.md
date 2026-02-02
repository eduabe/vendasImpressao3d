# Correção do Erro "react-scripts: command not found" no Vercel

## Problema

Ao tentar fazer deploy do frontend no Vercel, ocorria o erro:

```
sh: line 1: react-scripts: command not found
Error: Command "react-scripts build" exited with 127
```

## Causa Raiz

O problema ocorreu porque:

1. O projeto tem uma estrutura monorepo com `frontend/` e `backend/` na raiz
2. O arquivo `package.json` na raiz (backend) não tinha o script de `build`
3. O Vercel estava tentando executar `react-scripts build` na raiz, onde as dependências do frontend não estavam instaladas
4. O `react-scripts` só estava instalado na pasta `frontend/`

## Solução Implementada

### 1. Atualização do `package.json` (raiz)

Adicionados os scripts de build para instalar e compilar o frontend:

```json
{
  "scripts": {
    "build": "cd frontend && npm install && npm run build",
    "vercel-build": "cd frontend && npm install && npm run build"
  }
}
```

### 2. Configuração do `vercel.json` (raiz)

Simplificado para usar o script de build do package.json:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/build"
}
```

### 3. Configuração do `frontend/vercel.json`

Atualizado com configurações específicas do Create React App:

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app",
  "devCommand": "npm start"
}
```

## Como Funciona Agora

1. O Vercel executa `npm run build` na raiz
2. O script `build` no `package.json` da raiz:
   - Navega para a pasta `frontend/`
   - Instala as dependências do frontend (`npm install`)
   - Executa o build do frontend (`npm run build`)
   - O `react-scripts` é encontrado porque está instalado no `frontend/node_modules/`
3. O build é gerado em `frontend/build/`
4. O Vercel usa a pasta `frontend/build` como output

## Teste Local

Para testar o build localmente:

```bash
npm run build
```

## Deploy no Vercel

Agora o deploy deve funcionar sem o erro "react-scripts: command not found".
