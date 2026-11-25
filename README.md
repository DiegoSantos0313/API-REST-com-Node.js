# UniCoffee Users API

API REST de usuários e autenticação, construída com Node.js, TypeScript, Express e PostgreSQL.

## Requisitos

- Node.js 20 ou superior
- PostgreSQL 13 ou superior
- npm

## Instalação e configuração

No terminal, entre na pasta `tarefas-app/api` e instale as dependências:

```bash
npm install
```

Crie um banco PostgreSQL chamado `unicoffe_api` ou escolha outro nome. Copie `.env.example` para `.env` e ajuste `DATABASE_URL` e `JWT_SECRET`. O segredo JWT deve ser privado e ter pelo menos 32 caracteres.

Exemplo de URL:

```text
postgresql://postgres:sua_senha@localhost:5432/unicoffe_api
```

Execute a migração e inicie o servidor de desenvolvimento:

```bash
npm run db:migrate
npm run dev
```

A API ficará disponível em `http://localhost:3000`. Verifique a conexão com `GET /health`.

## Rotas

| Método | Rota | Autenticação | Descrição |
|---|---|---|---|
| POST | `/api/v1/auth/register` | Não | Cria conta e retorna token JWT |
| POST | `/api/v1/auth/login` | Não | Autentica e retorna token JWT |
| GET | `/api/v1/auth/me` | Bearer token | Retorna o perfil autenticado |
| PATCH | `/api/v1/auth/me` | Bearer token | Atualiza o nome do perfil |

Cadastro:

```json
{
  "name": "Ana Silva",
  "email": "ana@example.com",
  "password": "senha-segura-123"
}
```

Envie o token retornado em `Authorization: Bearer <token>` para as rotas protegidas. As senhas são armazenadas com bcrypt e nunca são incluídas nas respostas.

## Produção

Compile com `npm run build` e inicie com `npm start`. Configure variáveis de ambiente seguras; restrinja `CORS_ORIGIN` ao domínio necessário e use HTTPS. Esta versão usa access tokens JWT sem refresh token nem revogação individual.
