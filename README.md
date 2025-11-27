# Integração de Pesquisa In-App (CleverTap + Google Sheets)

Este projeto implementa uma solução completa de feedback para aplicativos móveis. Ele exibe uma pesquisa dentro do app (via CleverTap In-App), coleta as respostas e enriquece os dados automaticamente com a localização e endereço do usuário, salvando tudo em uma planilha do Google Sheets.

## 🚀 Funcionalidades

- **Frontend (In-App):** Interface limpa e responsiva (HTML/CSS) que captura o feedback.
- **Backend (Google Script):** Webhook que recebe os dados.
- **Enriquecimento de Dados:** O script consulta a API do CleverTap usando o CPF (Identity) do usuário para obter a localização exata (`platformInfo`) e converte Latitude/Longitude em um endereço legível (Geocoding reverso).
- **Armazenamento:** Salva Data, CPF, Nome, Respostas, Localização e Endereço no Google Sheets.

## 🛠️ Pré-requisitos

1.  Uma conta no **CleverTap** (com acesso de Admin para ver Account ID e Passcode).
2.  Uma conta **Google** (para criar a Planilha e o Script).

---

## 📦 Instalação Passo a Passo

### Passo 1: Configuração do Backend (Google Sheets)

1.  Crie uma nova **Planilha do Google**.
2.  No menu superior, vá em **Extensões** > **Apps Script**.
3.  Apague qualquer código que estiver no arquivo `Código.gs`.
4.  Copie o conteúdo do arquivo `backend/code.gs` deste repositório e cole no editor.
5.  **Configuração Obrigatória:** No início do script, preencha as variáveis com seus dados:
    ```javascript
    const CT_ACCOUNT_ID = 'SEU_ACCOUNT_ID_AQUI'; // Pegue no Painel do CleverTap > Settings
    const CT_PASSCODE = 'SEU_PASSCODE_AQUI';     // Pegue no Painel do CleverTap > Settings
    const CT_REGION = 'us1';                     // Geralmente 'us1' ou 'eu1'
    const SPREADSHEET_ID = 'ID_DA_SUA_PLANILHA'; // O código longo na URL da sua planilha
    ```
6.  **Implantar o Webhook:**
    * Clique no botão azul **Implantar** (Deploy) > **Nova Implantação**.
    * Tipo: **App da Web**.
    * Descrição: "Versão 1.0".
    * Executar como: **Eu** (seu email).
    * Quem pode acessar: **Qualquer pessoa** (Anyone). *Isso é crucial para funcionar no celular.*
    * Clique em **Implantar**.
7.  **Copie a URL do App da Web** gerada (termina com `/exec`). Você vai precisar dela no Passo 2.

### Passo 2: Configuração do Frontend (CleverTap)

1.  Crie uma nova campanha **In-App** no CleverTap.
2.  Escolha o template **Custom HTML**.
3.  Copie o conteúdo do arquivo `frontend/in-app-survey.html` deste repositório.
4.  Cole no editor do CleverTap.
5.  **Atualize a URL:** Procure a linha abaixo no código HTML e substitua pela URL que você copiou no passo anterior:
    ```javascript
    const GOOGLE_SHEETS_URL = '[https://script.google.com/macros/s/SUA-URL-AQUI/exec](https://script.google.com/macros/s/SUA-URL-AQUI/exec)';
    ```
6.  Salve e defina os gatilhos da campanha.

---

## ⚠️ Detalhes Técnicos

* **Envio de Dados:** O frontend utiliza `text/plain` no header para evitar bloqueios de CORS em WebViews (Android/iOS). O Backend processa isso automaticamente.
* **Geolocalização:** O sistema prioriza a busca de localização no array `platformInfo` da API do CleverTap, que provou ser mais preciso que o `profileData`.

## 📝 Licença

Este projeto é de uso livre.
