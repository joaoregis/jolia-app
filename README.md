# Jolia Finances - Gestão Financeira

Esta é uma aplicação web completa para gestão financeira pessoal e compartilhada, construída com tecnologias modernas para oferecer uma experiência de utilizador rápida, segura e intuitiva.

O projeto nasceu da necessidade de transformar uma complexa planilha de controlo financeiro numa aplicação robusta e escalável, permitindo uma visão clara e insights precisos sobre as finanças.

## ✨ Funcionalidades Principais

A aplicação possui um conjunto rico de funcionalidades pensadas para um controlo financeiro completo:

* **Gestão de Perfis e Subperfis:**
    * Criação de múltiplos perfis (ex: "Casa", "Pessoal") para isolar contextos financeiros.
    * Sistema de subperfis dentro de um perfil principal, ideal para gerir finanças de um casal ou de pessoas que dividem uma casa.
    * Arquivamento de perfis e subperfis, que são movidos para uma lixeira para posterior restauro ou exclusão permanente.

* **Controlo de Transações Detalhado:**
    * Registo de **receitas** e **despesas** com valores "Previsto" vs. "Efetivo".
    * Distinção entre despesas individuais (ligadas a um subperfil) e despesas da casa (`isShared`), que são visíveis na "Visão Geral".
    * Introdução de uma **Data de Pagamento/Recebimento** distinta da data de lançamento para um controlo de fluxo de caixa mais preciso.
    * Interface de edição rápida na própria tabela, permitindo alterar valores e status sem abrir um modal.

* **Fluxo de Fechamento de Mês:**
    * Um sistema robusto que "fecha" um mês, tornando as suas transações imutáveis e criando um histórico seguro.
    * Geração automática de transações **recorrentes** para o mês seguinte, replicando os valores (Previsto e Efetivo) e as datas (Lançamento e Pagamento) para poupar tempo.
    * A navegação entre meses permite visualizar todo o histórico financeiro.

* **Importação e Exportação de Dados:**
    * Uma modal de importação avançada que permite adicionar transações em massa a partir de um texto **JSON** ou de um ficheiro **CSV**.
    * Possibilidade de editar ou remover linhas de dados na pré-visualização antes de importar.
    * Funcionalidade para exportar os dados financeiros para formatos como JSON, CSV e XLSX.

* **Autenticação e Segurança:**
    * Sistema de login seguro por **Email e Senha**, garantindo que apenas utilizadores autorizados acedam à aplicação.
    * Rotas protegidas que redirecionam utilizadores não autenticados para a tela de login.
    * Regras de segurança no Firestore que garantem que apenas utilizadores logados possam ler e escrever dados.

* **Interface de Utilizador Refinada:**
    * Componentes personalizados como `CurrencyInput`, `DateInput` e `ToggleSwitch` para uma experiência de preenchimento de formulário moderna e intuitiva.
    * Layout responsivo e tema escuro (dark mode) para maior conforto visual.

## 🚀 Tecnologias Utilizadas

Este projeto foi construído com um conjunto de ferramentas modernas e eficientes:

* **Frontend:**
    * [React](https://reactjs.org/)
    * [TypeScript](https://www.typescriptlang.org/)
    * [Vite](https://vitejs.dev/)
    * [Tailwind CSS](https://tailwindcss.com/)
* **Backend & Base de Dados:**
    * [Firebase](https://firebase.google.com/) (Authentication, Firestore, Hosting)
* **Bibliotecas Principais:**
    * `react-router-dom` para navegação
    * `lucide-react` para ícones
    * `papaparse` para parsing de CSV
    * `xlsx` para exportação para Excel

## 🛠️ Configuração e Instalação Local

Para executar este projeto na sua máquina local, siga os passos abaixo.

**1. Clonar o Repositório**
```bash
git clone <URL_DO_SEU_REPOSITÓRIO_GIT>
cd jolia-app
```

**2. Instalar as Dependências**
```bash
npm install
```

**3. Configurar as Variáveis de Ambiente**

* Crie um ficheiro chamado `.env.local` na raiz do projeto.
* Copie as suas credenciais do Firebase para este ficheiro. Você pode encontrá-las nas configurações do seu projeto no Console do Firebase.

    ```dotenv
    VITE_FIREBASE_API_KEY="AIza..."
    VITE_FIREBASE_AUTH_DOMAIN="jolia-app.firebaseapp.com"
    VITE_FIREBASE_PROJECT_ID="jolia-app"
    VITE_FIREBASE_STORAGE_BUCKET="jolia-app.appspot.com"
    VITE_FIREBASE_MESSAGING_SENDER_ID="..."
    VITE_FIREBASE_APP_ID="1:..."
    ```
    > **Importante:** O ficheiro `.env.local` nunca deve ser enviado para o seu repositório Git. Certifique-se de que ele está no seu `.gitignore`.

**4. Configurar o Firebase**

* No [Console do Firebase](https://console.firebase.google.com/), certifique-se de que o provedor de autenticação **Email/Senha** está ativado.
* Verifique se as **Regras de Segurança (Security Rules)** do seu Firestore estão configuradas para permitir o acesso apenas a utilizadores autenticados.

**5. Executar a Aplicação**
```bash
npm run dev
```
A aplicação estará disponível em `http://localhost:5173` (ou outra porta indicada no terminal).

## 📜 Scripts Disponíveis

* `npm run dev`: Inicia o servidor de desenvolvimento.
* `npm run build`: Compila e otimiza a aplicação para produção, criando a pasta `dist`.
* `npm run preview`: Inicia um servidor local para visualizar a versão de produção (após executar `build`).
* `firebase deploy`: Publica o conteúdo da pasta `dist` no Firebase Hosting.
