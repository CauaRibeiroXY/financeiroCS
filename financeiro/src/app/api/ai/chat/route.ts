import { NextResponse } from 'next/server';
import { buildFinancialAIContext } from '@/app/lib/services/ai-context.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { apiKey: clientApiKey, model: selectedModel, messages } = body;

    // Usar a chave fornecida pelo cliente no painel, ou a variável de ambiente do servidor como fallback
    const apiKey = clientApiKey || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'Chave de API do Gemini não fornecida. Por favor, insira sua chave no painel de configurações acima ou configure GEMINI_API_KEY no servidor.',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Formato de mensagens inválido.' },
        { status: 400 }
      );
    }

    // Modelo selecionado (removendo prefixo 'models/' se presente para evitar duplicação)
    let targetModelClean = (selectedModel || 'gemini-3.8-flash').replace(/^models\//, '');

    // 1. Compilar contexto financeiro atualizado das finanças do usuário
    let financialContext = '';
    try {
      const contextData = await buildFinancialAIContext();
      financialContext = contextData.summaryText;
    } catch (err: unknown) {
      console.error('Erro ao construir contexto financeiro:', err);
      financialContext = '(Aviso: Não foi possível carregar o histórico financeiro completo do banco de dados no momento.)';
    }

    // 2. Instruções do Sistema (System Instruction) para atuação como consultor financeiro
    const systemInstruction = `
Você é o **Assistente Financeiro IA**, um especialista em finanças pessoais, corte de gastos, eliminação de ralos financeiros e planejamento orçamentário integrado diretamente ao painel de controle do usuário.

SEU OBJETIVO:
- Analisar com precisão os dados financeiros reais fornecidos no contexto (saldos, faturas de cartão, investimentos, receitas, despesas por categoria, recorrências e ralos de dinheiro detectados).
- Responder às dúvidas do usuário com clareza, empatia, tom encorajador e objetividade prática.
- Identificar vazamentos ("ralos de dinheiro"), estouros de orçamento, contas em risco, faturas altas ou oportunidades reais de economia imediata.
- Dar respostas formatadas em GitHub Flavored Markdown (com tópicos claros, tabelas quando apropriado e valores sempre formatados em R$).

REGRAS RÍGIDAS DE ATUAÇÃO:
1. Baseie-se ESTRITAMENTE nos dados reais do contexto financeiro fornecido abaixo. Não invente transações nem saldos fictícios.
2. Seja direto e prático. Mostre onde o usuário está perdendo dinheiro e quais ações imediatas tomar para estancar o ralo.
3. Ao sugerir cortes de gastos, foque primeiro em tarifas bancárias/juros (100% evitáveis), compras por impulso/delivery excessivo e assinaturas duplicadas ou esquecidas.
4. Caso o usuário pergunte algo que não está nos dados, informe respeitosamente o que você consegue ver no relatório atual.
`.trim();

    // 3. Filtrar mensagens válidas
    const validMessages = messages.filter(
      (m: ChatMessage) => m && typeof m.content === 'string' && m.content.trim().length > 0
    );

    // No Gemini, o primeiro turno em 'contents' OBRIGATORIAMENTE deve ter role 'user'.
    // Descartamos qualquer mensagem inicial do assistente (ex: boas-vindas da interface).
    let startIndex = 0;
    while (startIndex < validMessages.length && validMessages[startIndex].role === 'assistant') {
      startIndex++;
    }

    const cleanHistory = validMessages.slice(startIndex);
    if (cleanHistory.length === 0) {
      return NextResponse.json(
        { error: 'Nenhuma mensagem de usuário encontrada para enviar.' },
        { status: 400 }
      );
    }

    // Formatar histórico garantindo turnos alternados (user -> model -> user)
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    cleanHistory.forEach((msg: ChatMessage, index: number) => {
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user';
      let textContent = msg.content;

      // Injeta os dados financeiros na PRIMEIRA mensagem do usuário
      if (index === 0 && geminiRole === 'user') {
        textContent = `[DADOS FINANCEIROS ATUAIS DO USUÁRIO]:\n${financialContext}\n\n[MENSAGEM DO USUÁRIO]:\n${msg.content}`;
      }

      // Se o último turno já tiver o mesmo role, agrupa o texto em vez de quebrar a alternância
      if (contents.length > 0 && contents[contents.length - 1].role === geminiRole) {
        contents[contents.length - 1].parts[0].text += `\n\n${textContent}`;
      } else {
        contents.push({
          role: geminiRole,
          parts: [{ text: textContent }],
        });
      }
    });

    // 4. Fazer a requisição HTTP para a API do Google Gemini
    const bodyPayload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      contents,
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 2048,
      },
    };

    const callGemini = async (modelName: string) => {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      return fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bodyPayload),
      });
    };

    let response = await callGemini(targetModelClean);

    // Fallback inteligente: se o modelo retornar 404 (não encontrado na chave), tenta gemini-3.6-flash ou gemini-2.5-flash
    if (!response.ok && response.status === 404) {
      const fallbackList = ['gemini-3.8-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-2.5-flash'].filter(
        (m) => m !== targetModelClean
      );
      for (const fb of fallbackList) {
        console.warn(`Tentando fallback para ${fb}...`);
        const fallbackResponse = await callGemini(fb);
        if (fallbackResponse.ok) {
          response = fallbackResponse;
          targetModelClean = fb;
          break;
        }
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let parsedError = 'Erro na resposta da API do Gemini.';
      try {
        const jsonErr = JSON.parse(errorText);
        parsedError = jsonErr.error?.message || parsedError;
      } catch {}

      return NextResponse.json(
        { error: `Erro na API do Gemini: ${parsedError}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const assistantReply =
      candidate?.content?.parts?.[0]?.text ||
      'Não foi possível obter uma resposta do modelo no momento.';

    return NextResponse.json({
      reply: assistantReply,
      modelUsed: targetModelClean,
    });
  } catch (err: unknown) {
    console.error('Erro na rota /api/ai/chat:', err);
    const errorMessage = err instanceof Error ? err.message : 'Erro interno ao processar conversa.';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
