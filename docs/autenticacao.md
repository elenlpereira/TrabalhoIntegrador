# Autenticação e Autorização

## Tecnologia utilizada

**JWT (JSON Web Token)** via biblioteca `jsonwebtoken`.  
O token é gerado no login, armazenado no `localStorage` do browser e enviado em toda requisição pelo header `Authorization: Bearer <token>`.

---

## Credenciais padrão

| Perfil    | E-mail                  | Senha       |
|-----------|-------------------------|-------------|
| Gerente   | `admin@bar.com`         | `123456`    |
| Atendente | `maria@bar.com`         | `123456`    |

> Todos os usuários do seed usam a senha `123456`.

---

## Fluxo de autenticação

1. O usuário acessa `POST /api/auth/login` com `{ email, senha }`.
2. O backend valida o e-mail e compara a senha com o hash bcrypt.
3. Em caso de sucesso, retorna `{ token, usuario: { id_usuario, nome, perfil_acesso } }`.
4. O frontend salva `token` e `usuario` no `localStorage`.
5. O interceptor do Axios injeta `Authorization: Bearer <token>` em todas as requisições.
6. Ao clicar em **Sair**, `localStorage` é limpo e o usuário é redirecionado para `/login`.

---

## Estrutura de arquivos

### Backend

| Arquivo | Responsabilidade |
|---|---|
| `src/controllers/authController.js` | Lógica de login: valida credenciais e gera o JWT |
| `src/routes/authRoutes.js` | `POST /api/auth/login` (rota pública) |
| `src/middlewares/autenticar.js` | Verifica e decodifica o token em todas as rotas protegidas |
| `src/middlewares/autorizarGerente.js` | Bloqueia usuários com perfil diferente de `Gerente` |

### Frontend

| Arquivo | Responsabilidade |
|---|---|
| `src/contexts/AuthContext.jsx` | Contexto React com `usuario`, `login()` e `logout()` |
| `src/services/api.js` | Interceptor que injeta o token no header de cada requisição |
| `src/pages/Login.jsx` | Tela de login com validação de e-mail e senha |
| `src/components/Header.jsx` | Cabeçalho compartilhado com nome, perfil e botão Sair |
| `src/components/RotaProtegida.jsx` | Redireciona para `/login` se não autenticado; aceita prop `apenasGerente` |

---

## Perfis e permissões

### Atendente
- Acesso a: Clientes, Estoque (leitura e edição), Comandas, Fichas
- **Não pode**: criar/editar/remover Fornecedores, Usuários ou Compras

### Gerente
- Acesso total a todos os módulos
- Módulo **Fornecedores** só aparece no menu para Gerentes

### Controle no backend

| Rota | Restrição |
|---|---|
| `POST/PUT/PATCH/DELETE /api/fornecedores` | `autorizarGerente` |
| Todas as rotas `/api/usuarios` | `autorizarGerente` |
| Todas as rotas `/api/compras` | `autorizarGerente` |
| Demais rotas | `autenticar` (qualquer perfil) |

---

## Token JWT

- **Payload**: `{ id_usuario, nome, perfil_acesso }`
- **Validade**: 8 horas
- **Segredo**: variável `JWT_SECRET` no `.env`
