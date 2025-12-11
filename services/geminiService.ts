import { GoogleGenAI } from "@google/genai";
import { FormData, TabType, GeneratedArticle } from "../types";

const createPrompt = (tab: TabType, data: FormData): string => {
  const dataHoraTexto = (data.date && data.time) ? `${data.date} às ${data.time}` : "Data recente";

  let specificContext = "";

  if (tab === 'geral') {
    specificContext = `
      TIPO: Notícia Geral. 
      LOCAL: ${data.geralLocal}. 
      RELATO: ${data.geralRelato}.
    `;
  } else if (tab === 'bombeiros') {
    specificContext = `
      TIPO: Acidente de Trânsito / Ocorrência Bombeiros.
      NATUREZA: ${data.acidenteTipo}.
      LOCAL: ${data.acidenteLocal}.
      ENVOLVIDOS: ${data.acidenteEnvolvidos}.
      Nº VÍTIMAS: ${data.acidenteQtdVitimas}.
      TIPO LESÕES: ${data.acidenteLesoes}.
      QUEM ATENDEU: ${data.acidenteAtendimento}.
      DESTINO VÍTIMAS: ${data.acidenteDestino}.
      RELATO DO FATO: ${data.acidenteRelato}.
    `;
  } else if (tab === 'policia') {
    specificContext = `
      TIPO: Ocorrência Policial.
      NATUREZA DO CRIME: ${data.crimeTipo}.
      BAIRRO: ${data.crimeBairro}.
      LOCAL EXATO: ${data.crimeLocal}.
      PARA ONDE FOI LEVADO: ${data.crimeDestino}.
      EQUIPE: ${data.crimePolicia}.
      DETALHES EXTRAS: ${data.crimeDetalhes}.
    `;
  }

  return `
    Você é um repórter experiente do site "Catalão Online". Escreva uma matéria jornalística completa e também uma sugestão de legenda para o Instagram.
    
    DADOS DA OCORRÊNCIA:
    DATA/HORA: ${dataHoraTexto}
    ${specificContext}
    (Se houver imagens anexadas, use-as para descrever melhor o cenário, veículos ou contexto visual, mas mantenha o tom profissional).

    DIRETRIZES DA MATÉRIA:
    1. Escreva um título (Manchete) forte na primeira linha iniciado por "TÍTULO:".
    2. IMPORTANTE: O Título deve estar em "Sentence case" (Apenas a primeira letra da frase em maiúscula, o restante em minúsculo, exceto nomes próprios). Exemplo: "Acidente envolve dois carros no centro" e NÃO "Acidente Envolve Dois Carros No Centro".
    3. Primeiro parágrafo: Lide jornalístico (Quem, quando, onde, o quê).
    4. Se for Acidente: Destaque o estado das vítimas e o trânsito.
    5. Se for Policial: Use termos técnicos adequados (conduzido à delegacia, suspeito, etc) e destaque a ação da polícia.
    6. Encerre a matéria citando "Fonte: Catalão Online".
    7. Comece o corpo da notícia com "CORPO:".
    
    DIRETRIZES DO INSTAGRAM:
    8. Crie uma seção iniciada por "INSTAGRAM:".
    9. Escreva uma legenda engajadora, estruturada em parágrafos curtos com espaçamento (pule linhas entre eles) para facilitar a leitura.
    10. Use emojis no início dos tópicos importantes.
    11. Liste 5 a 10 hashtags relevantes para a região de Catalão/GO após o texto.
    12. OBRIGATÓRIO: A última linha da legenda DEVE ser exatamente: "🔗 Confira a matéria completa no link da bio".
    
    SAÍDA ESPERADA:
    TÍTULO: [Título Aqui (Apenas 1ª letra maiúscula)]
    CORPO: [Texto da matéria]
    INSTAGRAM: [Texto para o Instagram]
  `;
};

export const generateArticle = async (tab: TabType, data: FormData): Promise<GeneratedArticle> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const promptText = createPrompt(tab, data);

    // Prepare contents. If images exist, add them as parts.
    const parts: any[] = [{ text: promptText }];

    if (data.images && data.images.length > 0) {
      data.images.forEach((base64String) => {
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,") to get raw base64
        const base64Data = base64String.split(',')[1]; 
        // Simple MIME type detection based on header or default to jpeg
        let mimeType = "image/jpeg";
        if (base64String.startsWith("data:image/png")) mimeType = "image/png";
        if (base64String.startsWith("data:image/webp")) mimeType = "image/webp";

        if (base64Data) {
            parts.push({
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            });
        }
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        role: 'user',
        parts: parts
      },
    });

    const text = response.text || "";
    
    let title = "Notícia Catalão Online";
    let body = "";
    let instagramContent = "";

    // Parse blocks
    const partsSplit = text.split("INSTAGRAM:");
    if (partsSplit.length > 1) {
      instagramContent = partsSplit[1].trim();
    }

    const mainContent = partsSplit[0];
    const bodyParts = mainContent.split("CORPO:");

    if (bodyParts.length > 1) {
      body = bodyParts[1].trim();
      const titleSection = bodyParts[0];
      if (titleSection.includes("TÍTULO:")) {
        title = titleSection.replace("TÍTULO:", "").trim();
      } else {
        title = titleSection.trim();
      }
    } else {
      // Fallback
      body = mainContent.replace("TÍTULO:", "").trim();
    }

    return { title, body, instagramContent };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Falha ao gerar notícia. Verifique sua chave de API.");
  }
};