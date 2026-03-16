# ☕ Coffee Tracker

O **Coffee Tracker** é uma aplicação web moderna e elegante projetada para entusiastas de café que desejam acompanhar seu consumo diário, competir com amigos e monitorar seus hábitos de forma visual e intuitiva.

![Dashboard Preview](https://img.shields.io/badge/Status-Functional-brightgreen)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

## ✨ Funcionalidades

- **Autenticação Segura**: Sistema de login e registro utilizando JWT (JSON Web Tokens).
- **Dashboard Dinâmico**: Registro de consumo com apenas um clique e visualização do total diário.
- **Histórico em Tempo Real**: Lista detalhada dos cafés consumidos no dia com atualização otimista (sem necessidade de F5).
- **Ranking Global**: Competitividade saudável através de rankings diários e semanais.
- **Perfil Customizável**: Gerenciamento de dados do usuário com suporte a atualizações parciais.
- **Design Premium**: Interface Responsiva, Clean e com foco na experiência do usuário (UX).

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** com **TypeScript**
- **Vite** para build e desenvolvimento ultra-rápido
- **Tailwind CSS** para estilização moderna e responsiva
- **Framer Motion** para animações fluidas
- **Lucide React** para iconografia elegante
- **Date-fns** para manipulação precisa de datas

### Backend Integration
- Integrado com **Spring Boot API**
- Persistência em **PostgreSQL** (via backend)
- Gerenciamento de sessão persistente no navegador

## 🛠️ Configuração Local

### Pré-requisitos
- Node.js (v18 ou superior)
- Backend Spring Boot rodando na porta 8080 (opcional se usar modo mock)

### Instalação

1. Clone o repositório:
```bash
git clone https://github.com/rivaldodev/coffeeTracker.git
cd coffee-tracker
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env` na raiz do projeto (ou edite o existente):
```env
VITE_API_URL=/api
VITE_USE_MOCK=false
```

4. Inicie o servidor de desenvolvimento:
```bash
npm run dev
```

## 🔒 Segurança

A aplicação utiliza um proxy via Vite para evitar problemas de CORS e proteger a comunicação entre o frontend e a API. Tokens de autenticação são armazenados de forma segura e enviados em todas as requisições protegidas.

---
Desenvolvido com ❤️ por [Rivaldo Freitas](https://github.com/rivaldodev)
