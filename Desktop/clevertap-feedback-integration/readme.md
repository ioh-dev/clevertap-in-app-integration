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

## 🔄 Como Funciona: Fluxo Completo de Dados

### 1. Usuário Responde a Pesquisa (Frontend)

Quando o usuário visualiza e responde a pesquisa no aplicativo:

1. **Exibição:** O CleverTap exibe a pesquisa HTML personalizada dentro do app
2. **Interação:** O usuário seleciona opções (radio buttons, checkboxes, etc.)
3. **Captura de Dados:** O JavaScript captura automaticamente:
   - CPF (Identity) do usuário - obtido via `CleverTap.getCleverTapID()`
   - Nome do usuário - obtido via `CleverTap.profile.getName()`
   - Respostas selecionadas na pesquisa

### 2. Envio para o Backend (HTTP POST)

O frontend envia os dados para o Google Apps Script via requisição HTTP:

```javascript
fetch(GOOGLE_SHEETS_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'text/plain' }, // Evita bloqueios CORS em apps móveis
  body: JSON.stringify({
    cpf: "12345678900",
    nome: "João Silva",
    respostas: { pergunta1: "Sim", pergunta2: "Ótimo" }
  })
})
```

**Por que `text/plain`?** Apps móveis (Android/iOS) usam WebViews que podem bloquear requisições `application/json` por questões de segurança (CORS). O tipo `text/plain` bypassa essa restrição.

### 3. Backend Recebe e Enriquece os Dados (Google Apps Script)

O webhook no Google Apps Script processa os dados em 4 etapas:

#### Etapa 3.1: Recepção e Parse
```javascript
function doPost(e) {
  const dados = JSON.parse(e.postData.contents); // Converte texto para objeto
  // dados = { cpf: "...", nome: "...", respostas: {...} }
}
```

#### Etapa 3.2: Busca Localização na API do CleverTap

O script faz uma chamada para a **CleverTap Profile API** para obter dados do usuário:

**URL da API:**
```
https://{região}.api.clevertap.com/1/profile.json?identity={CPF}
```

**Autenticação:**
- Header `X-CleverTap-Account-Id`: Seu Account ID
- Header `X-CleverTap-Passcode`: Seu Passcode

**Exemplo de Requisição:**
```javascript
const url = `https://us1.api.clevertap.com/1/profile.json?identity=12345678900`;
const response = UrlFetchApp.fetch(url, {
  headers: {
    'X-CleverTap-Account-Id': 'W9R-486-4R5Z',
    'X-CleverTap-Passcode': 'ABC-123-XYZ'
  }
});
```

**Resposta da API (simplificada):**
```json
{
  "record": {
    "email": "joao@email.com",
    "name": "João Silva",
    "platformInfo": [
      {
        "platform": "Android",
        "lat": -23.5505,
        "lon": -46.6333,
        "build": 42
      }
    ]
  }
}
```

**De onde vem Latitude e Longitude?**
- Vem do array `platformInfo` dentro do perfil do usuário
- Cada dispositivo do usuário gera uma entrada com `lat` e `lon`
- O script pega as coordenadas do dispositivo mais recente (último item do array)

#### Etapa 3.3: Geocoding Reverso (Coordenadas → Endereço)

Com a latitude e longitude em mãos, o script consulta a **API do Google Maps** para converter coordenadas em endereço legível:

**URL da API:**
```
https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lon}
```

**Exemplo de Requisição:**
```javascript
const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=-23.5505,-46.6333`;
const response = UrlFetchApp.fetch(url);
```

**Resposta da API (simplificada):**
```json
{
  "results": [
    {
      "formatted_address": "Av. Paulista, 1578 - Bela Vista, São Paulo - SP, 01310-200, Brasil"
    }
  ]
}
```

O script extrai o `formatted_address` do primeiro resultado.

#### Etapa 3.4: Salvamento no Google Sheets

Finalmente, todos os dados são organizados e salvos na planilha:

```javascript
sheet.appendRow([
  new Date(),           // Data/Hora da resposta
  dados.cpf,            // CPF (Identity)
  dados.nome,           // Nome do usuário
  JSON.stringify(dados.respostas), // Respostas da pesquisa
  `${lat}, ${lon}`,     // Coordenadas (da API CleverTap)
  endereco              // Endereço formatado (da API Google Maps)
]);
```

**Resultado na Planilha:**

| Data | CPF | Nome | Respostas | Localização | Endereço |
|------|-----|------|-----------|-------------|----------|
| 2024-01-15 14:30 | 12345678900 | João Silva | {"pergunta1":"Sim"} | -23.5505, -46.6333 | Av. Paulista, 1578... |

---

## 🔐 APIs Utilizadas

### 1. CleverTap Profile API
- **Finalidade:** Buscar dados do perfil do usuário (localização, dispositivo, etc.)
- **Documentação:** https://developer.clevertap.com/docs/profile-api
- **Autenticação:** Account ID + Passcode (headers HTTP)
- **Dados Extraídos:** `platformInfo[].lat` e `platformInfo[].lon`

### 2. Google Maps Geocoding API
- **Finalidade:** Converter coordenadas (lat/lon) em endereço legível
- **Documentação:** https://developers.google.com/maps/documentation/geocoding
- **Autenticação:** Não requer (versão básica)
- **Dados Extraídos:** `results[0].formatted_address`

---

## ⚠️ Detalhes Técnicos Importantes

* **Envio de Dados:** O frontend utiliza `text/plain` no header para evitar bloqueios de CORS em WebViews (Android/iOS). O Backend processa isso automaticamente.
* **Geolocalização:** O sistema prioriza a busca de localização no array `platformInfo` da API do CleverTap, que provou ser mais preciso que o `profileData`.
* **Timeout:** As chamadas de API têm timeout de 10 segundos. Se a API do CleverTap ou Google Maps não responder, o sistema salva os dados sem localização.
* **Privacidade:** As coordenadas e endereços são obtidos dos dados já coletados pelo CleverTap SDK, não são capturados diretamente pelo formulário.

## 📝 Licença

Este projeto é de uso livre.