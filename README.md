# Clínica Médica — Sistema de Agendamento

Aplicação web completa para gerenciamento de consultas médicas, construída com **Vue.js 3** (frontend) e **Node.js + Express** (backend), com persistência em **MongoDB**.

---

## Funcionalidades

| Funcionalidade | Descrição |
|---|---|
| Autenticação JWT | Login e cadastro seguros com tokens JWT e hash bcrypt |
| Controle de papéis | Paciente / Secretário / Admin com rotas protegidas |
| Agendamento | Criação, edição e cancelamento de consultas |
| Verificação de horário | Detecção automática de conflitos de horário por médico |
| Horários disponíveis | Listagem de slots de 30 min entre 08h–17h30 |
| Consulta de CEP | Preenchimento automático de endereço via ViaCEP |
| Previsão de chuva | Alerta de chuva no dia da consulta via OpenWeatherMap |
| Painel administrativo | Secretários e admins gerenciam consultas e usuários |
| Perfil do paciente | Edição de dados pessoais, endereço e senha |

---

## Tecnologias

### Backend
- **Node.js 20** + **Express 4**
- **MongoDB** + **Mongoose**
- **JWT** (jsonwebtoken) — autenticação stateless
- **bcryptjs** — hash de senhas
- **helmet** — cabeçalhos de segurança HTTP
- **express-rate-limit** — proteção contra brute-force
- **express-validator** — validação de entrada
- **axios** — consumo de APIs externas

### Frontend
- **Vue.js 3** (Composition API + `<script setup>`)
- **Vite** — build e dev server
- **Pinia** — gerenciamento de estado
- **Vue Router 4** — roteamento com guards de autenticação
- **Axios** — requisições HTTP

### Infra / Deploy
- **Docker** + **Docker Compose**
- **Nginx** — serve o frontend e faz proxy para a API

---

## Pré-requisitos

- Node.js 18+
- MongoDB local **ou** conta no MongoDB Atlas
- Chave de API do [OpenWeatherMap](https://openweathermap.org/api) (gratuita)
- Docker (opcional, para deploy com containers) - Coloquei essa opção  para facilitar o uso da aplicação.

---

## Configuração e Execução Local

### 1. Clone o repositório
```bash
git clone [<url-do-repo>](https://github.com/rafael346/av2.git)
cd av2
```

### 2. Configure o backend
```bash
cd backend
cp .env.example .env
# Edite o .env e preencha JWT_SECRET e OPENWEATHER_API_KEY
npm install
npm run dev    # Sobe o servidor em http://localhost:5000
```

### 3. Configure o frontend
```bash
cd frontend
npm install
npm run dev    # Abre em http://localhost:5173
```

> O Vite já tem proxy configurado: chamadas para `/api/*` são redirecionadas para `localhost:5000`.

---

## Deploy com Docker

```bash
# Na raiz do projeto:
cp backend/.env.example .env
# Edite .env com JWT_SECRET e OPENWEATHER_API_KEY

docker-compose up -d --build
```

A aplicação ficará disponível em **http://localhost** (porta 80).

O Nginx serve o frontend e faz proxy das rotas `/api/*` para o container do backend.

---

## Estrutura do Projeto

```
av2/
├── backend/
│   ├── src/
│   │   ├── app.js               # Express app (middlewares, rotas)
│   │   ├── server.js            # Entry point
│   │   ├── config/
│   │   │   └── database.js      # Conexão com MongoDB
│   │   ├── models/
│   │   │   ├── User.js          # Modelo de usuário
│   │   │   └── Appointment.js   # Modelo de consulta
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── appointmentController.js
│   │   │   ├── userController.js
│   │   │   └── externalController.js
│   │   ├── middleware/
│   │   │   ├── auth.js          # protect + authorize (JWT)
│   │   │   └── validate.js      # express-validator errors
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── appointments.js
│   │   │   ├── users.js
│   │   │   └── external.js
│   │   └── services/
│   │       └── weatherService.js
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── main.js
│   │   ├── App.vue
│   │   ├── assets/main.css
│   │   ├── router/index.js
│   │   ├── store/auth.js        # Pinia
│   │   ├── services/
│   │   │   ├── api.js           # Axios instance
│   │   │   └── index.js         # Service wrappers
│   │   ├── components/
│   │   │   ├── NavBar.vue
│   │   │   ├── AlertMessage.vue
│   │   │   └── AppointmentCard.vue
│   │   └── views/
│   │       ├── LoginView.vue
│   │       ├── RegisterView.vue
│   │       ├── DashboardView.vue
│   │       ├── AppointmentsView.vue
│   │       ├── NewAppointmentView.vue
│   │       ├── AppointmentDetailView.vue
│   │       ├── AdminView.vue
│   │       └── ProfileView.vue
│   ├── Dockerfile
│   ├── nginx.conf
│   └── vite.config.js
│
└── docker-compose.yml
```

---

## Endpoints da API

### Auth
| Método | Rota | Descrição |
|---|---|---|
| POST | `/api/auth/register` | Cadastro de usuário |
| POST | `/api/auth/login` | Login — retorna JWT |
| GET | `/api/auth/me` | Dados do usuário autenticado |

### Consultas (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/appointments` | Lista consultas |
| POST | `/api/appointments` | Cria consulta |
| GET | `/api/appointments/slots` | Horários disponíveis |
| GET | `/api/appointments/:id` | Detalhes |
| PUT | `/api/appointments/:id` | Atualiza |
| DELETE | `/api/appointments/:id` | Cancela |

### Externos (autenticado)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/external/cep/:cep` | Endereço pelo CEP (ViaCEP) |
| GET | `/api/external/weather?city=&date=` | Previsão de chuva (OpenWeatherMap) |

### Usuários (admin/secretário)
| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/users` | Lista usuários |
| GET | `/api/users/:id` | Detalhes |
| PUT | `/api/users/:id` | Atualiza |
| DELETE | `/api/users/:id` | Desativa (soft delete) |

---

## Segurança Implementada

- **Senhas**: hash com bcrypt (fator 12) — nunca armazenadas em texto plano
- **JWT**: assinado com segredo configurável, tempo de expiração definido
- **Autorização por papel**: pacientes só acessam dados próprios
- **Helmet**: cabeçalhos de segurança HTTP automáticos
- **Rate limiting**: 100 req / 15 min por IP nas rotas `/api/*`
- **Validação de entrada**: express-validator em todas as rotas de mutação
- **CORS**: restrito ao domínio do frontend
- **Soft delete**: usuários desativados não são excluídos fisicamente
- **Payload limit**: 10kb no body parser

---

## Deploy em Produção

### Opção 1 — Render (recomendado, gratuito)

#### Backend
1. Crie uma conta em [render.com](https://render.com)
2. **New → Web Service** → conecte o repositório
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/server.js`
4. Adicione as variáveis de ambiente na aba **Environment**
5. Use o [MongoDB Atlas](https://www.mongodb.com/atlas) (gratuito) e cole a URI em `MONGODB_URI`

#### Frontend
1. **New → Static Site** → conecte o mesmo repositório
2. Configure:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
3. Em `frontend/src/services/api.js`, altere `baseURL` para a URL do backend no Render (ex.: `https://clinica-backend.onrender.com/api`)

---

### Opção 2 — Railway

1. Acesse [railway.app](https://railway.app) e crie um projeto
2. Adicione um serviço **MongoDB** direto pelo marketplace do Railway
3. Adicione o backend: aponte para a pasta `backend/`, configure as variáveis de ambiente
4. Adicione o frontend como Static Site (ou use Vercel — veja abaixo)

---

### Opção 3 — Vercel (apenas frontend) + Render (backend)

| Etapa | Plataforma | Configuração |
|---|---|---|
| Backend | Render | Root: `backend/`, start: `node src/server.js` |
| Frontend | Vercel | Root: `frontend/`, framework: Vite |
| Banco de dados | MongoDB Atlas | Tier gratuito M0 |

No Vercel, crie o arquivo `frontend/vercel.json` para o SPA funcionar:
```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Defina a variável de ambiente no Vercel:
```
VITE_API_BASE_URL=https://seu-backend.onrender.com/api
```

E atualize `frontend/src/services/api.js`:
```js
baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
```

---

### Opção 4 — VPS / Servidor próprio (Docker)

```bash
# No servidor (Ubuntu/Debian):
git clone <url-do-repo> && cd av2
cp backend/.env.example .env
# Edite .env com os valores de produção
docker compose up -d --build
# Acesse http://<ip-do-servidor>
```

Para HTTPS, coloque um Nginx ou Caddy como reverse proxy na frente.

---

## Variáveis de Ambiente

| Variável | Descrição | Obrigatória |
|---|---|---|
| `PORT` | Porta do servidor | Não (padrão: 5000) |
| `MONGODB_URI` | URI de conexão MongoDB | Sim |
| `JWT_SECRET` | Segredo do token JWT (mín. 32 chars) | Sim |
| `JWT_EXPIRES_IN` | Expiração do JWT | Não (padrão: 7d) |
| `OPENWEATHER_API_KEY` | Chave OpenWeatherMap | Sim |
| `FRONTEND_URL` | URL do frontend (CORS) | Não |
| `NODE_ENV` | Ambiente (`development`/`production`) | Não |

