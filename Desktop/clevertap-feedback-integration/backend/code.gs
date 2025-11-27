// ============================================
// GOOGLE APPS SCRIPT - BACKEND DE INTEGRAÇÃO
// ============================================

// --- 1. CONFIGURAÇÕES (PREENCHA AQUI) ---
const CT_ACCOUNT_ID = 'INSIRA_SEU_ACCOUNT_ID'; 
const CT_PASSCODE = 'INSIRA_SEU_PASSCODE';     
const CT_REGION = 'us1';                       
const SPREADSHEET_ID = 'INSIRA_O_ID_DA_PLANILHA_DA_URL';
const SHEET_NAME = 'Página1';

// --- 2. FUNÇÃO PRINCIPAL (WEBHOOK) ---
function doPost(e) {
  try {
    // Validação de segurança
    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput("Erro: Sem dados").setMimeType(ContentService.MimeType.TEXT);
    }

    // Parse inteligente (aceita JSON ou Texto plano para evitar erro de CORS)
    let data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      data = e.parameter; // Fallback
    }

    if (!data) return ContentService.createTextOutput("Erro: JSON inválido");

    // Variáveis recebidas do App
    const userIdentity = data.identity; 
    const userName = data.name;
    
    let finalLat = data.latitude;
    let finalLong = data.longitude;
    let finalAddress = "Não identificado";
    let source = "Evento (HTML)";

    // --- BUSCA DE LOCALIZAÇÃO (VIA CPF -> API CLEVERTAP) ---
    if ((!finalLat || finalLat === "0" || finalLat === "") && userIdentity) {
      const apiResult = fetchProfileLocation(userIdentity);
      if (apiResult && apiResult.lat) {
        finalLat = apiResult.lat;
        finalLong = apiResult.lng;
        source = apiResult.source;
      }
    }

    // --- CONVERSÃO PARA ENDEREÇO (GEOCODING REVERSO) ---
    if (finalLat && finalLat !== "0" && finalLat !== "Não Disponível") {
      finalAddress = getAddressFromCoordinates(finalLat, finalLong);
    }

    // --- GRAVAÇÃO NA PLANILHA ---
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Cria a aba e cabeçalhos se não existirem
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      sheet.appendRow(['Data', 'CPF', 'Nome', 'Problema?', 'Tipo', 'Detalhes', 'Lat', 'Long', 'Endereço Aproximado', 'Origem']);
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#fadf4b');
    }
    
    sheet.appendRow([
      Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'dd/MM/yyyy HH:mm:ss'),
      userIdentity || 'N/A',
      userName || 'N/A',
      data.hadProblem ? 'Sim' : 'Não',
      data.problemType || 'N/A',
      data.details || 'N/A',
      finalLat || '',
      finalLong || '',
      finalAddress,
      source
    ]);
    
    return ContentService.createTextOutput("Sucesso").setMimeType(ContentService.MimeType.TEXT);
    
  } catch (error) {
    console.error("ERRO CRÍTICO:", error);
    return ContentService.createTextOutput("Erro no servidor").setMimeType(ContentService.MimeType.TEXT);
  }
}

// --- 3. API PERFIL (BUSCA PLATFORM INFO) ---
function fetchProfileLocation(identity) {
  try {
    const url = `https://${CT_REGION}.api.clevertap.com/1/profile.json?identity=${encodeURIComponent(identity)}`;
    const options = { 
      'method': 'get', 
      'headers': { 
        'X-CleverTap-Account-Id': CT_ACCOUNT_ID, 
        'X-CleverTap-Passcode': CT_PASSCODE, 
        'Content-Type': 'application/json' 
      }, 
      'muteHttpExceptions': true 
    };
    
    const response = UrlFetchApp.fetch(url, options);
    const json = JSON.parse(response.getContentText());
    
    if (json.status === "success" && json.record) {
      // Prioridade: Platform Info
      if (json.record.platformInfo && Array.isArray(json.record.platformInfo)) {
        for (const device of json.record.platformInfo) {
          if (device.location && Array.isArray(device.location) && device.location.length >= 2) {
             if (device.location[0] !== 0) return { lat: device.location[0], lng: device.location[1], source: "PlatformInfo" };
          }
        }
      }
      // Fallback: Profile Data
      if (json.record.profileData) {
        const p = json.record.profileData;
        const loc = p.Location || p.location || p.Geo || p.geo;
        if (loc) return { lat: loc.lat || loc.latitude, lng: loc.lon || loc.lng || loc.longitude, source: "ProfileData" };
      }
    }
    return null;
  } catch (e) { console.error("Erro API CleverTap:", e); return null; }
}

// --- 4. GEOCODIFICAÇÃO (GOOGLE MAPS NATIVO) ---
function getAddressFromCoordinates(lat, lng) {
  try {
    const r = Maps.newGeocoder().setLanguage('pt-BR').reverseGeocode(lat, lng);
    return (r.status === 'OK' && r.results.length > 0) ? r.results[0].formatted_address : "Endereço não encontrado";
  } catch (e) { return "Erro API Maps"; }
}