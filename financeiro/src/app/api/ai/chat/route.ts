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
            'Chave de API do Gemini não fornecida. Insira a sua chave no painel de configurações ou defina a variável GEMINI_API_KEY no servidor.',
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Formato de mensagens inválido para o histórico de chat.' },
        { status: 400 }
      );
    }

    // Modelo selecionado (padrão: gemini-flash ou gemini-2.5-flash)
    const model = selectedModel || 'gemini-flash';

    // 1. Compilar contexto financeiro atualizado das finanças do usuário
    let financialContext = '';
    try {
      const contextData = await buildFinancialAIContext();
      financialContext = contextData.summaryText;
    } catch (err: any) {
      console.error('Erro ao construir contexto financeiro:', err);
      financialContext = '(Aviso: Não foi possível carregar o histórico financeiro completo do banco de dados no momento.)';
    }

    // 2. Instruções do Sistema (System Instruction) para atuação como consultor financeiro
    const systemInstruction = `
Você é o **Assistente Financeiro IA**, um especialista em finanças pessoais e planejamento orçamentário integrado diretamente ao painel de controle do usuário.

SEU OBJETIVO:
- Analisar com precisão os dados financeiros reais fornecidos no contexto (saldos, faturas de cartão, investimentos, receitas, despesas por categoria e recorrências).
- Responder às dúvidas do usuário com clareza, empatia e objetividade prática.
- Identificar estouros de orçamento, contas em risco, faturas altas ou oportunidades reais de economia.
- Dar respostas formatadas em GitHub Flavored Markdown (com tópicos claros, tabelas quando apropriado e valores sempre formatados em R$).

REGRAS RÍGIDAS DE ATUAÇÃO:
1. Baseie-se ESTRITAMENTE nos dados reais do contexto financeiro fornecido abaixo. Não invente transações nem saldos fictícios.
2. Seja direto e encorajador. Evite termos jargões bancários desnecessários.
3. Ao sugerir cortes de gastos, foque primeiro em categorias de alta volatilidade (ex: Restaurantes, Lazer, Assinaturas duplicadas).
4. Caso o usuário pergunte algo que não está nos dados, informe respeitosamente o que você consegue ver no relatório atual.
`.trim();

    // 3. Formatar histórico de mensagens para a estrutura esperada pela API do Gemini
    const contents = messages.map((msg: ChatMessage, index: number) => {
      const geminiRole = msg.role === 'assistant' ? 'model' : 'user';

      let textContent = msg.content;
      if (index === 0 && msg.role === 'user') {
        textContent = `[DADOS FINANCEIROS ATUAIS DO USUÁRIO]:\n${financialContext}\n\n[PERGUNTA DO USUÁRIO]:\n${msg.content}`;
      }

      return {
        role: geminiRole,
        parts: [{ text: textContent }],
      };
    });

    // 4. Função para requisitar a API do Gemini com relatório detalhado de erros
    const tryGeminiRequest = async (targetModel: string) => {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;

      const apiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemInstruction }],
          },
          contents,
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
      });

      return apiResponse;
    };

    let response = await tryGeminiRequest(model);

    // Se o modelo solicitado der 404 (modelo inexistente ou indisponível), faz fallback automático
    if (!response.ok && response.status === 404 && model !== 'gemini-flash') {
      console.warn(`Modelo ${model} retornou 404. Tentando fallback para gemini-flash...`);
      response = await tryGeminiRequest('gemini-flash');
      if (!response.ok && response.status === 404) {
        response = await tryGeminiRequest('gemini-2.5-flash');
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      let detailMsg = errorText;
      try {
        const jsonErr = JSON.parse(errorText);
        detailMsg = jsonErr.error?.message || jsonErr.error?.status || errorText;
      } catch {}

      return NextResponse.json(
        {
          error: `Erro na API do Google Gemini (Status ${response.status}): ${detailMsg}`,
          statusCode: response.status,
          rawError: detailMsg,
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    // Tratar casos onde a API responde sem candidatos válidos (ex: bloqueio de segurança)
    if (!candidate || !candidate.content) {
      const finishReason = candidate?.finishReason || 'UNKNOWN';
      return NextResponse.json(
        {
          error: `A API do Gemini não retornou conteúdo. Motivo do término: ${finishReason}`,
        },
        { status: 500 }
      );
    }

    const assistantReply =
      candidate.content.parts?.[0]?.text ||
      'Não foi possível extrair uma resposta em texto do modelo.';

    return NextResponse.json({
      reply: assistantReply,
      modelUsed: model,
    });
  } catch (err: any) {
    console.error('Erro na rota /api/ai/chat:', err);
    return NextResponse.json(
      { error: `Erro interno no servidor ao processar IA: ${err.message || String(err)}` },
      { status: 500 }
    );
  }
}
