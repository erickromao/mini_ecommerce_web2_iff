# Romão Store — Painel Administrativo

Mini e-commerce full stack desenvolvido como exercício prático da disciplina de Web 2 (IFF). O sistema permite o gerenciamento completo de produtos e usuários através de um painel administrativo moderno, com autenticação, autorização por perfil e diversas funcionalidades bônus.

---

## Tecnologias

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 |
| Backend | Next.js API Routes (Node.js) |
| Banco de dados | SQLite via `better-sqlite3` |
| Autenticação | JWT (`jose`) + cookie httpOnly |
| Senhas | `bcryptjs` (hash + salt) |
| Estilização | Tailwind CSS v4 |
| Linguagem | TypeScript |

---

## Funcionalidades

### CRUD Completo
- **Produtos** — cadastrar, listar, visualizar detalhes, editar e excluir
- **Usuários** — cadastrar, listar, visualizar detalhes, editar e excluir

### Autenticação e Autorização
- Login com e-mail e senha
- Sessão via JWT armazenado em cookie httpOnly (7 dias)
- Dois perfis: **admin** (acesso total) e **user** (somente leitura)
- Rotas protegidas por middleware — usuários não autenticados são redirecionados para o login

### Bônus implementados
- Busca e filtro server-side (por nome, categoria, status)
- Paginação server-side (8 itens por página)
- Upload de imagem do produto (base64, máx. 1 MB)

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18 ou superior
- npm

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/erickromao/mini_ecommerce_web2_iff.git
cd mini_ecommerce_web2_iff

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000** no navegador.

O banco de dados SQLite é criado automaticamente em `./database.db` na primeira execução, já populado com dados de exemplo (produtos e usuários).

### Credenciais de acesso

| Perfil | E-mail | Senha |
|--------|--------|-------|
| Administrador | admin@loja.com | senha123 |
| Usuário comum | joao@email.com | senha123 |
| Usuário comum | maria@email.com | senha123 |

> **Importante:** somente o perfil **administrador** pode criar, editar e excluir produtos e usuários.

---

## Estrutura do projeto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/          # login, logout, me
│   │   ├── products/      # CRUD de produtos
│   │   └── users/         # CRUD de usuários
│   ├── login/             # Página de login
│   ├── products/          # Listagem, detalhe, cadastro e edição
│   ├── users/             # Listagem, detalhe, cadastro e edição
│   └── page.tsx           # Dashboard com estatísticas
├── components/
│   ├── Sidebar.tsx        # Navegação lateral
│   ├── AppShell.tsx       # Layout principal
│   ├── ProductForm.tsx    # Formulário de produto (criar/editar)
│   ├── UserForm.tsx       # Formulário de usuário (criar/editar)
│   ├── Pagination.tsx     # Componente de paginação
│   └── Icons.tsx          # Ícones SVG inline
├── context/
│   └── AuthContext.tsx    # Contexto global de autenticação
└── lib/
    ├── db.ts              # Conexão, schema e seed do banco
    ├── auth.ts            # Assinatura e verificação de JWT
    ├── fetchJson.ts       # Helper para chamadas à API
    └── types.ts           # Interfaces TypeScript
```

---

## Como funciona

### Fluxo de autenticação

1. O usuário acessa qualquer rota — o **middleware** (`src/middleware.ts`) intercepta a requisição
2. Se não houver cookie de sessão válido, é redirecionado para `/login`
3. Ao fazer login, a API valida as credenciais no banco, gera um **JWT** assinado e o armazena no cookie `session` (httpOnly, duração de 7 dias)
4. A cada nova requisição, o middleware verifica a assinatura e a validade do JWT; se expirado, deleta o cookie e redireciona para o login

### Banco de dados

O SQLite é inicializado automaticamente pela função `getDb()` em `src/lib/db.ts`:

- **Desenvolvimento:** `./database.db` na raiz do projeto
- **Produção:** `/tmp/database.db`

Na primeira execução, o schema é criado e os dados iniciais (seed) são inseridos automaticamente — 5 produtos e 3 usuários.

### API REST

Todas as rotas da API ficam em `src/app/api/` e seguem o padrão REST:

| Método | Rota | Descrição | Acesso |
|--------|------|-----------|--------|
| `POST` | `/api/auth/login` | Fazer login | Público |
| `GET` | `/api/auth/me` | Dados do usuário logado | Autenticado |
| `POST` | `/api/auth/logout` | Encerrar sessão | Autenticado |
| `GET` | `/api/products` | Listar produtos (busca + filtros + paginação) | Público |
| `POST` | `/api/products` | Criar produto | Admin |
| `GET` | `/api/products/[id]` | Detalhe do produto | Público |
| `PUT` | `/api/products/[id]` | Editar produto | Admin |
| `DELETE` | `/api/products/[id]` | Excluir produto | Admin |
| `GET` | `/api/users` | Listar usuários | Admin |
| `POST` | `/api/users` | Criar usuário | Admin |
| `GET` | `/api/users/[id]` | Detalhe do usuário | Admin |
| `PUT` | `/api/users/[id]` | Editar usuário | Admin |
| `DELETE` | `/api/users/[id]` | Excluir usuário | Admin |

---

## Deploy

O projeto está configurado para deploy na **Vercel**:

1. Importe o repositório em [vercel.com](https://vercel.com)
2. Adicione a variável de ambiente:
   ```
   JWT_SECRET=sua-chave-secreta-aqui
   ```
3. Clique em **Deploy** — a Vercel detecta o Next.js automaticamente

---

## Autor

**Erick Romão** — Turma Web 2, IFF
