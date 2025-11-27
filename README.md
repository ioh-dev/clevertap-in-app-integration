# 📱 In-App Message CleverTap <> Google Sheets

## 📋 Visão Geral

Este projeto consiste em um formulário de pesquisa interativo para coletar feedback dos usuários do aplicativo Hubees. Os dados são automaticamente salvos em uma planilha do Google Sheets.

## 🎯 Funcionalidades

- ✅ Fluxo interativo em múltiplas etapas
- ✅ Design moderno e responsivo
- ✅ Animações suaves
- ✅ Integração com Google Sheets
- ✅ Barra de progresso
- ✅ Validação de dados
- ✅ Loading states

## 📁 Arquivos Incluídos

1. **inapp-survey.html** - Interface do formulário
2. **google-apps-script.gs** - Script para integração com Google Sheets
3. **README.md** - Este guia de implementação

## 🚀 Passo a Passo da Configuração

### Etapa 1: Criar a Planilha do Google Sheets

1. Acesse: https://sheets.google.com
2. Crie uma nova planilha
3. Dê um nome (ex: "Feedback Hubees")
4. Copie o ID da planilha da URL:
   ```
   https://docs.google.com/spreadsheets/d/SEU_ID_AQUI/edit
   ```

### Etapa 2: Configurar o Google Apps Script

1. Acesse: https://script.google.com
2. Clique em **"Novo projeto"**
3. Cole o código do arquivo `google-apps-script.gs`
4. **IMPORTANTE**: Edite a linha 35 e substitua:
   ```javascript
   const SPREADSHEET_ID = 'SEU_ID_DA_PLANILHA_AQUI';
   ```
   Pelo ID que você copiou no passo anterior

5. Salve o projeto (Ctrl+S ou ⌘+S)

### Etapa 3: Implantar o Web App

1. No Google Apps Script, clique em **"Implantar"** > **"Nova implantação"**
2. Clique no ícone de engrenagem ⚙️ e selecione **"Aplicativo da Web"**
3. Configure:
   - **Descrição**: "API Feedback Hubees"
   - **Executar como**: "Eu" (sua conta do Google)
   - **Quem tem acesso**: "Qualquer pessoa"
4. Clique em **"Implantar"**
5. **Autorize o script** quando solicitado
6. **Copie a URL do Web App** (algo como: `https://script.google.com/macros/s/...`)

### Etapa 4: Configurar o HTML

1. Abra o arquivo `inapp-survey.html`
2. Encontre a linha 287:
   ```javascript
   const GOOGLE_SHEETS_URL = 'SUA_URL_DO_GOOGLE_APPS_SCRIPT_AQUI';
   ```
3. Substitua pela URL que você copiou no passo anterior
4. Salve o arquivo

### Etapa 5: Testar a Integração

1. Abra o arquivo HTML em um navegador
2. Preencha o formulário
3. Envie o feedback
4. Verifique se os dados apareceram na planilha do Google Sheets

## 🎨 Personalização

### Alterar Cores

No arquivo HTML, você pode personalizar as cores principais:

```css
/* Gradiente principal (linhas 20-21) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);

/* Cor do logo e elementos principais (linha 42) */
color: #667eea;

/* Botão primário (linha 101) */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Alterar Textos

Você pode modificar os textos das perguntas diretamente no HTML:

- **Linha 190**: Pergunta inicial
- **Linha 199**: Pergunta sobre tipo de problema
- **Linha 211**: Pergunta sobre detalhes

### Ajustar Comportamento

No JavaScript (seção `<script>`), você pode:

- **Linha 339**: Ajustar tempo de auto-fechamento (atualmente 3 segundos)
- **Linha 389**: Configurar comportamento de erro
- **Linha 215**: Alterar limite de caracteres do textarea

## 📊 Estrutura dos Dados no Google Sheets

A planilha terá as seguintes colunas:

| Data/Hora | Teve Problema? | Tipo de Problema | Detalhes | Timestamp ISO |
|-----------|----------------|------------------|----------|---------------|
| 24/11/2025 15:30 | Sim | Problema no aplicativo | O app travou ao... | 2025-11-24T15:30:00.000Z |

## 🔧 Troubleshooting

### Problema: Dados não aparecem na planilha

**Soluções:**
1. Verifique se o ID da planilha está correto no Apps Script
2. Confirme que você autorizou o script
3. Verifique se a URL do Web App foi copiada corretamente para o HTML
4. Veja o console do navegador (F12) para erros

### Problema: Erro de CORS

**Solução:**
O código já está configurado com `mode: 'no-cors'`, que resolve este problema.

### Problema: Script não foi autorizado

**Solução:**
1. Vá em Google Apps Script
2. Clique em "Executar" na função `testarIntegracao`
3. Autorize quando solicitado

## 📱 Implementação no App

### Para WebView (iOS/Android)

```javascript
// React Native
import { WebView } from 'react-native-webview';

<WebView
  source={{ uri: 'https://seu-servidor.com/hubees-inapp-survey.html' }}
  style={{ flex: 1 }}
/>
```

### Para Iframe (Web)

```html
<iframe 
  src="inapp-survey.html" 
  style="width: 100%; height: 600px; border: none;"
></iframe>
```

## 🔒 Segurança

### Recomendações:

1. **Limitação de taxa**: Considere adicionar rate limiting no Apps Script
2. **Validação de dados**: O script já valida dados básicos
3. **HTTPS**: Sempre use HTTPS em produção
4. **Backup**: Faça backups regulares da planilha

## 📈 Análise de Dados

### Exemplos de Análise no Google Sheets:

```
=COUNTIF(B:B, "Sim")                    // Total de problemas reportados
=COUNTIF(C:C, "Problema no aplicativo") // Problemas específicos do app
=AVERAGE(LEN(D:D))                       // Média de caracteres nas descrições
```

## 🆘 Suporte

Para problemas ou dúvidas:

1. Verifique o console do navegador (F12 > Console)
2. Verifique os logs do Google Apps Script (View > Logs)
3. Teste a função `testarIntegracao()` no Apps Script

## 📝 Notas Importantes

- ⚠️ O modo `no-cors` não permite ler a resposta do servidor, mas os dados são salvos normalmente
- 💡 Os dados ficam disponíveis imediatamente na planilha
- 🔄 Você pode adicionar mais campos ao formulário editando ambos os arquivos
- 🎨 O design é totalmente customizável via CSS

## 🎉 Pronto!

Seu formulário de feedback está configurado e funcionando! Os dados serão automaticamente salvos no Google Sheets sempre que um usuário enviar feedback.

---

**Desenvolvido para Hubees** 🐝
