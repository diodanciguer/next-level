<div align="center">
  <img src="https://img.shields.io/badge/Status-Online-success?style=for-the-badge" alt="Status" />
  <img src="https://img.shields.io/badge/Version-1.0-blue?style=for-the-badge" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-Black?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/Prisma-1B2228?style=for-the-badge&logo=Prisma&logoColor=white" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <br />
  <br />
  <h1>⚔️ Próximo Nível (Next Level) 🛡️</h1>
  <p>
    <b>Gamify Your Life. Level Up Your Habits.</b><br />
    <i>(Role a página para a versão em Português / Scroll down for the English version)</i>
  </p>
</div>

---

## 🇧🇷 Português

### 📖 Sobre o Projeto
**Próximo Nível** é um rastreador de hábitos gamificado (RPG Habit Tracker) que transforma suas tarefas diárias, estudos e metas em uma aventura épica. Em vez de apenas marcar caixas de seleção, você ganha Pontos de Experiência (XP) e Moedas de Ouro (🪙) por cada bom hábito concluído, permitindo que você suba de nível na vida real!

### ✨ Funcionalidades Principais
*   **🧙‍♂️ Classes de Personagem:** Comece como Iniciante e escolha o seu caminho (Guerreiro, Mago, Caçador, etc.).
*   **📈 Sistema de Níveis e XP:** Cumpra seus hábitos diários para ganhar XP e subir de nível. 
*   **🏆 Ranks e Evolução Visual:** Seu avatar evolui visualmente! Suba do Rank E (Recruta) até o Rank S (Lenda Viva), ganhando molduras exclusivas e auras mágicas ao redor do seu perfil.
*   **💀 Sistema de Vilões (Maus Hábitos):** Registrou um mau hábito (ex: comer doces, procrastinar)? Você perde XP e moedas. Uma verdadeira punição para te manter na linha!
*   **📜 Missões Épicas:** Defina grandes objetivos e classifique-os por dificuldade para ganhar recompensas massivas.
*   **🛍️ Loja de Recompensas:** Use o ouro que você ganhou com seu suor para "comprar" recompensas na vida real (ex: "Jogar videogame por 2h", "Comprar um livro").
*   **📊 Dashboard de Progresso:** Acompanhe sua consistência semanal através de gráficos interativos.

### 🛠️ Tecnologias Utilizadas
*   **Front-end:** [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS, Recharts (Gráficos), shadcn/ui.
*   **Back-end:** Next.js API Routes.
*   **Banco de Dados:** [Neon](https://neon.tech/) (PostgreSQL Serverless) gerenciado pelo [Prisma ORM](https://www.prisma.io/).
*   **Hospedagem:** [Vercel](https://vercel.com/).

### 🚀 Como Rodar Localmente

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure o seu banco de dados no arquivo `.env`:
   ```env
   DATABASE_URL="postgresql://usuario:senha@seu-host/banco?sslmode=require"
   ```
4. Atualize o banco de dados:
   ```bash
   npx prisma db push
   ```
5. Inicie o servidor:
   ```bash
   npm run dev
   ```

---

## 🇺🇸 English

### 📖 About the Project
**Next Level (Próximo Nível)** is a gamified RPG Habit Tracker that transforms your daily chores, studies, and goals into an epic adventure. Instead of just ticking checkboxes, you earn Experience Points (XP) and Gold Coins (🪙) for every good habit completed, allowing you to level up in real life!

### ✨ Core Features
*   **🧙‍♂️ Character Classes:** Start as a Beginner and choose your path (Warrior, Mage, Hunter, etc.).
*   **📈 Leveling & XP System:** Complete your daily habits to earn XP and level up.
*   **🏆 Ranks & Visual Evolution:** Your avatar evolves visually! Climb from Rank E (Recruit) to Rank S (Living Legend), unlocking exclusive borders and magical auras around your profile.
*   **💀 Villains System (Bad Habits):** Logged a bad habit (e.g., eating sweets, procrastinating)? You lose XP and coins. A real punishment to keep you on track!
*   **📜 Epic Missions:** Set huge goals, rank them by difficulty, and defeat them for massive rewards.
*   **🛍️ Reward Store:** Spend your hard-earned gold to "buy" real-life rewards (e.g., "Play video games for 2h", "Buy a new book").
*   **📊 Progress Dashboard:** Track your weekly consistency and XP growth through beautiful interactive charts.

### 🛠️ Tech Stack
*   **Front-end:** [Next.js](https://nextjs.org/) (App Router), React, Tailwind CSS, Recharts, shadcn/ui.
*   **Back-end:** Next.js API Routes.
*   **Database:** [Neon](https://neon.tech/) (Serverless PostgreSQL) managed by [Prisma ORM](https://www.prisma.io/).
*   **Hosting:** [Vercel](https://vercel.com/).

### 🚀 How to Run Locally

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your database connection in the `.env` file:
   ```env
   DATABASE_URL="postgresql://user:password@your-host/db?sslmode=require"
   ```
4. Sync the database:
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```

---
<div align="center">
  <p>Built with ⚔️ by Diego Danciguer</p>
</div>
