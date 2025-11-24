# 🚀 Recursos Avançados e Customizações

## 📧 Notificações por E-mail

### Adicione ao Google Apps Script

```javascript
function enviarNotificacaoEmail(data) {
  // Configure seu e-mail aqui
  const EMAIL_DESTINO = 'suporte@hubees.com.br';
  
  const assunto = `Novo Feedback - ${data.problemType}`;
  const corpo = `
    <h2>Novo Feedback Recebido</h2>
    <p><strong>Data/Hora:</strong> ${data.timestamp}</p>
    <p><strong>Teve Problema:</strong> ${data.hadProblem ? 'Sim' : 'Não'}</p>
    <p><strong>Tipo:</strong> ${data.problemType || 'N/A'}</p>
    <p><strong>Detalhes:</strong></p>
    <p>${data.details || 'N/A'}</p>
  `;
  
  MailApp.sendEmail({
    to: EMAIL_DESTINO,
    subject: assunto,
    htmlBody: corpo
  });
}

// Adicione isso na função doPost, após appendRow:
if (data.hadProblem) {
  enviarNotificacaoEmail(data);
}
```

---

## 📊 Dashboard em Tempo Real

### Google Apps Script - API Web

```javascript
function doGet(e) {
  const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Feedback');
  
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1);
  
  const stats = {
    total: rows.length,
    comProblema: rows.filter(r => r[1] === 'Sim').length,
    problemaApp: rows.filter(r => r[2] === 'Problema no aplicativo').length,
    problemaEstacionamento: rows.filter(r => r[2] === 'Problema no estacionamento').length,
    ultimos5: rows.slice(-5).reverse().map(row => ({
      data: row[0],
      tipo: row[2],
      detalhes: row[3]
    }))
  };
  
  return ContentService
    .createTextOutput(JSON.stringify(stats))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### HTML Dashboard
```html
<!DOCTYPE html>
<html>
<head>
    <title>Dashboard - Hubees</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px;
            background: #f5f5f5;
        }
        .card {
            background: white;
            padding: 20px;
            margin: 10px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .stat {
            font-size: 48px;
            font-weight: bold;
            color: #667eea;
        }
    </style>
</head>
<body>
    <h1>Dashboard de Feedbacks</h1>
    
    <div class="card">
        <h2>Estatísticas</h2>
        <div>Total de Feedbacks: <span class="stat" id="total">0</span></div>
        <div>Com Problema: <span class="stat" id="comProblema">0</span></div>
        <div>Taxa de Problemas: <span class="stat" id="taxa">0%</span></div>
    </div>
    
    <div class="card">
        <h2>Últimos 5 Feedbacks</h2>
        <div id="ultimos"></div>
    </div>
    
    <script>
        const API_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT';
        
        async function loadData() {
            const response = await fetch(API_URL);
            const data = await response.json();
            
            document.getElementById('total').textContent = data.total;
            document.getElementById('comProblema').textContent = data.comProblema;
            document.getElementById('taxa').textContent = 
                ((data.comProblema / data.total) * 100).toFixed(1) + '%';
            
            const ultimosDiv = document.getElementById('ultimos');
            ultimosDiv.innerHTML = data.ultimos5.map(item => `
                <div style="border-bottom: 1px solid #eee; padding: 10px;">
                    <strong>${item.data}</strong> - ${item.tipo}<br>
                    ${item.detalhes}
                </div>
            `).join('');
        }
        
        loadData();
        setInterval(loadData, 30000); // Atualiza a cada 30s
    </script>
</body>
</html>
```

---

## 🔔 Webhooks e Integrações

### Slack Integration

Adicione ao Apps Script:
```javascript
function enviarParaSlack(data) {
  const SLACK_WEBHOOK_URL = 'sua-webhook-url-do-slack';
  
  const message = {
    text: `🚨 Novo Problema Reportado`,
    blocks: [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "🐝 Hubees - Novo Feedback"
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Tipo:*\n${data.problemType}`
          },
          {
            type: "mrkdwn",
            text: `*Data:*\n${new Date(data.timestamp).toLocaleString('pt-BR')}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Detalhes:*\n${data.details}`
        }
      }
    ]
  };
  
  UrlFetchApp.fetch(SLACK_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(message)
  });
}
```

### Discord Integration

```javascript
function enviarParaDiscord(data) {
  const DISCORD_WEBHOOK_URL = 'sua-webhook-url-do-discord';
  
  const embed = {
    embeds: [{
      title: "🐝 Hubees - Novo Feedback",
      color: 6724846, // Cor roxa
      fields: [
        {
          name: "Tipo de Problema",
          value: data.problemType,
          inline: true
        },
        {
          name: "Data/Hora",
          value: new Date(data.timestamp).toLocaleString('pt-BR'),
          inline: true
        },
        {
          name: "Detalhes",
          value: data.details || 'N/A'
        }
      ],
      timestamp: data.timestamp
    }]
  };
  
  UrlFetchApp.fetch(DISCORD_WEBHOOK_URL, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(embed)
  });
}
```

---

## 📱 Identificação do Usuário

### Passar dados do App para o HTML

Modifique a URL ao abrir o WebView:
```javascript
// React Native
const userId = '12345';
const userName = 'João Silva';
const webViewUrl = `https://seu-dominio.com/hubees-inapp-survey.html?userId=${userId}&userName=${encodeURIComponent(userName)}`;
```

### Capturar no HTML
```javascript
// Adicione ao início do script no HTML
const urlParams = new URLSearchParams(window.location.search);
surveyData.userId = urlParams.get('userId');
surveyData.userName = urlParams.get('userName');
```

### Atualizar Apps Script
```javascript
// Adicione colunas na planilha para User ID e Nome
const rowData = [
  formattedDate,
  data.userId || 'N/A',
  data.userName || 'N/A',
  data.hadProblem ? 'Sim' : 'Não',
  data.problemType || 'N/A',
  data.details || 'N/A',
  data.timestamp
];
```

---

## 🎨 Temas Personalizados

### Dark Mode
```javascript
// Adicione no HTML
const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;

if (isDarkMode) {
  document.body.style.background = 'linear-gradient(135deg, #1a202c 0%, #2d3748 100%)';
  // Ajuste outras cores conforme necessário
}
```

### Tema Dinâmico via URL
```javascript
// URL: ?theme=dark ou ?theme=light
const theme = urlParams.get('theme') || 'light';

const themes = {
  light: {
    primary: '#667eea',
    secondary: '#764ba2',
    background: '#ffffff',
    text: '#2d3748'
  },
  dark: {
    primary: '#9f7aea',
    secondary: '#b794f4',
    background: '#1a202c',
    text: '#ffffff'
  }
};

const currentTheme = themes[theme];
// Aplique as cores dinamicamente
```

---

## 📍 Geolocalização

### Capturar localização no HTML
```javascript
navigator.geolocation.getCurrentPosition(
  (position) => {
    surveyData.latitude = position.coords.latitude;
    surveyData.longitude = position.coords.longitude;
  },
  (error) => {
    console.log('Geolocalização não disponível');
  }
);
```

---

## 📸 Anexar Imagens

### HTML com Upload de Imagem
```html
<input 
  type="file" 
  accept="image/*" 
  capture="camera"
  id="imageInput"
  style="margin-bottom: 15px;"
>

<script>
document.getElementById('imageInput').addEventListener('change', function(e) {
  const file = e.target.files[0];
  const reader = new FileReader();
  
  reader.onload = function(event) {
    surveyData.image = event.target.result.split(',')[1]; // Base64
  };
  
  reader.readAsDataURL(file);
});
</script>
```

### Apps Script para salvar no Google Drive
```javascript
function salvarImagemNoDrive(base64Data, fileName) {
  const blob = Utilities.newBlob(
    Utilities.base64Decode(base64Data),
    'image/jpeg',
    fileName
  );
  
  const folder = DriveApp.getFolderById('ID_DA_PASTA_NO_DRIVE');
  const file = folder.createFile(blob);
  
  return file.getUrl();
}
```

---

## 🔍 Analytics Integration

### Google Analytics
```html
<!-- Adicione no <head> -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
  
  // Rastrear eventos
  function trackEvent(action, category, label) {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
  
  // Exemplo de uso:
  // trackEvent('survey_started', 'Survey', 'Initial Screen');
</script>
```

---

## 🌐 Multi-idioma

### Adicionar suporte a idiomas
```javascript
const translations = {
  'pt-BR': {
    question1: 'Você teve algum problema ao utilizar o aplicativo?',
    yesButton: 'Sim, tive um problema',
    noButton: 'Não, está tudo bem! ✅',
    // ... outras traduções
  },
  'en-US': {
    question1: 'Did you have any problems using the app?',
    yesButton: 'Yes, I had a problem',
    noButton: 'No, everything is fine! ✅',
    // ... outras traduções
  }
};

const lang = urlParams.get('lang') || 'pt-BR';
const t = translations[lang];

// Use: t.question1 ao invés de texto fixo
```

---

## 🔐 Rate Limiting

### Limitar respostas por usuário
```javascript
// No Apps Script
function verificarRateLimit(userId) {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Feedback');
  const data = sheet.getDataRange().getValues();
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const feedbacksHoje = data.filter(row => {
    const rowDate = new Date(row[0]);
    rowDate.setHours(0, 0, 0, 0);
    return row[1] === userId && rowDate.getTime() === hoje.getTime();
  });
  
  return feedbacksHoje.length < 3; // Máximo 3 por dia
}
```

---

## 📊 Exportação Automatizada

### Enviar relatório semanal por e-mail
```javascript
function enviarRelatorioSemanal() {
  const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName('Feedback');
  const data = sheet.getDataRange().getValues();
  
  const umaSemanaAtras = new Date();
  umaSemanaAtras.setDate(umaSemanaAtras.getDate() - 7);
  
  const feedbacksSemana = data.slice(1).filter(row => 
    new Date(row[0]) >= umaSemanaAtras
  );
  
  const stats = {
    total: feedbacksSemana.length,
    comProblema: feedbacksSemana.filter(r => r[1] === 'Sim').length,
    // ... outras estatísticas
  };
  
  const htmlBody = `
    <h2>Relatório Semanal - Hubees</h2>
    <p>Total de feedbacks: ${stats.total}</p>
    <p>Com problemas: ${stats.comProblema}</p>
    <!-- ... mais informações -->
  `;
  
  MailApp.sendEmail({
    to: 'gestao@hubees.com.br',
    subject: 'Relatório Semanal de Feedbacks - Hubees',
    htmlBody: htmlBody
  });
}

// Configure um gatilho semanal para esta função
```

---

## 🎯 A/B Testing

### Testar diferentes versões
```javascript
// Versão A ou B aleatória
const version = Math.random() < 0.5 ? 'A' : 'B';
surveyData.version = version;

if (version === 'A') {
  // Versão com pergunta direta
  document.querySelector('.question').textContent = 
    'Você teve algum problema?';
} else {
  // Versão com pergunta mais detalhada
  document.querySelector('.question').textContent = 
    'Como foi sua experiência ao utilizar o aplicativo hoje?';
}
```

---

## 🔄 Sincronização Offline

### Service Worker para funcionar offline
```javascript
// sw.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('hubees-v1').then((cache) => {
      return cache.addAll([
        '/hubees-inapp-survey.html',
        // ... outros recursos
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

---

Estes recursos avançados podem ser implementados conforme a necessidade do seu projeto! 🚀
