'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Settings,
  Send,
  Loader2,
  Key,
  CheckCircle2,
  AlertCircle,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  Smartphone,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface GeminiModel {
  id: string;
  name: string;
  description?: string;
}

const DEFAULT_MODELS: GeminiModel[] = [
  {
    id: 'gemini-3.8-flash',
    name: 'Gemini 3.8 Flash (Recomendado)',
    description: 'Flagship mais avançado para raciocínio financeiro e respostas rápidas',
  },
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    description: 'Versão estável de alta velocidade',
  },
  {
    id: 'gemini-3.5-flash-lite',
    name: 'Gemini 3.5 Flash-Lite',
    description: 'Ultra econômico e ideal para tarefas simples',
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro Preview',
    description: 'Raciocínio profundo para planejamento orçamentário complexo',
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    description: 'Versão anterior com boa estabilidade',
  },
];

const SUGGESTED_PROMPTS = [
  '💸 Onde estou perdendo dinheiro este mês e o que cortar primeiro?',
  '🔍 Identifique tarifas bancárias, assinaturas esquecidas e efeito cafezinho.',
  '📊 Faça um diagnóstico geral das minhas finanças este mês.',
  '💡 Onde posso cortar despesas para economizar mais?',
  '💳 Qual a situação das minhas faturas de cartão de crédito?',
  '🎯 Analise meu saldo e progresso nas metas financeiras.',
];

/**
 * Componente simples e robusto para renderizar Markdown na resposta do assistente
 */
function MarkdownRenderer({ content }: { content: string }) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <div className="space-y-3 text-sm leading-relaxed text-[#e6edf3]">
      {paragraphs.map((para, pIdx) => {
        const trimmed = para.trim();
        if (!trimmed) return null;

        // Cabeçalhos (###, ##, #)
        if (trimmed.startsWith('#')) {
          const level = trimmed.match(/^#+/)?.[0].length || 1;
          const text = trimmed.replace(/^#+\s*/, '');
          if (level === 1) {
            return (
              <h2 key={pIdx} className="text-lg font-bold text-[#58a6ff] pt-2 pb-1 border-b border-[#30363d]">
                {formatInline(text)}
              </h2>
            );
          }
          if (level === 2) {
            return (
              <h3 key={pIdx} className="text-base font-semibold text-[#58a6ff] pt-2">
                {formatInline(text)}
              </h3>
            );
          }
          return (
            <h4 key={pIdx} className="text-sm font-semibold text-[#e6edf3] pt-1">
              {formatInline(text)}
            </h4>
          );
        }

        // Tabelas simples em Markdown
        if (trimmed.includes('|') && trimmed.split('\n').length >= 2) {
          const rows = trimmed.split('\n').filter((r) => r.trim().startsWith('|'));
          if (rows.length >= 2) {
            const headerCols = rows[0].split('|').slice(1, -1).map((c) => c.trim());
            const dataRows = rows.slice(2); // pula cabeçalho e separador

            return (
              <div key={pIdx} className="overflow-x-auto my-2 rounded-lg border border-[#30363d]">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#21262d] text-[#e6edf3]">
                    <tr>
                      {headerCols.map((col, cIdx) => (
                        <th key={cIdx} className="px-3 py-2 font-semibold">
                          {formatInline(col)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d] bg-[#161b22]">
                    {dataRows.map((row, rIdx) => {
                      const cols = row.split('|').slice(1, -1).map((c) => c.trim());
                      return (
                        <tr key={rIdx} className="hover:bg-[#21262d]/50">
                          {cols.map((col, cIdx) => (
                            <td key={cIdx} className="px-3 py-2 text-[#e6edf3]">
                              {formatInline(col)}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          }
        }

        // Listas com marcadores (- ou *)
        if (trimmed.split('\n').every((line) => line.trim().startsWith('- ') || line.trim().startsWith('* '))) {
          const items = trimmed.split('\n').map((l) => l.trim().replace(/^[-*]\s*/, ''));
          return (
            <ul key={pIdx} className="list-disc list-inside space-y-1 pl-2 text-[#e6edf3]">
              {items.map((item, iIdx) => (
                <li key={iIdx}>{formatInline(item)}</li>
              ))}
            </ul>
          );
        }

        // Linhas avulsas com tópicos misturados
        const lines = trimmed.split('\n');
        if (lines.length > 1 && lines.some((l) => l.trim().startsWith('- ') || l.trim().startsWith('* '))) {
          return (
            <div key={pIdx} className="space-y-1">
              {lines.map((line, lIdx) => {
                const lineTrimmed = line.trim();
                if (lineTrimmed.startsWith('- ') || lineTrimmed.startsWith('* ')) {
                  return (
                    <div key={lIdx} className="flex items-start gap-2 pl-2">
                      <span className="text-[#58a6ff] font-bold">•</span>
                      <span>{formatInline(lineTrimmed.replace(/^[-*]\s*/, ''))}</span>
                    </div>
                  );
                }
                return <p key={lIdx}>{formatInline(line)}</p>;
              })}
            </div>
          );
        }

        return <p key={pIdx}>{formatInline(trimmed)}</p>;
      })}
    </div>
  );
}

function formatInline(text: string): React.ReactNode {
  const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-semibold text-white">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={index} className="bg-[#21262d] text-[#58a6ff] px-1.5 py-0.5 rounded text-xs">
          {part.slice(1, -1)}
        </code>
      );
    }
    return part;
  });
}

export default function AIAssistantPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState('gemini-3.8-flash');
  const [availableModels, setAvailableModels] = useState<GeminiModel[]>(DEFAULT_MODELS);
  const [fetchingModels, setFetchingModels] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [savingServer, setSavingServer] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Olá! Sou seu **Assistente Financeiro com Google Gemini**.\n\nJá analisei seus dados de saldos, faturas, gastos do mês, metas e **ralos financeiros** (onde você pode estar perdendo dinheiro). Como posso ajudar você hoje?\n\n- Escolha uma das perguntas rápidas abaixo ou digite sua dúvida!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'failed'>('idle');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Buscar modelos liberados para a API Key do usuário
  const fetchAvailableModels = useCallback(async (keyToUse?: string) => {
    const targetKey = (keyToUse || apiKey).trim();
    if (!targetKey) return;

    setFetchingModels(true);
    try {
      const res = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: targetKey }),
      });

      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.models) && data.models.length > 0) {
          setAvailableModels(data.models);
          // Se o modelo atual não está na lista, seleciona o primeiro
          const exists = data.models.some((m: GeminiModel) => m.id === selectedModel);
          if (!exists) {
            setSelectedModel(data.models[0].id);
          }
        }
      }
    } catch (err) {
      console.error('Erro ao buscar modelos:', err);
    } finally {
      setFetchingModels(false);
    }
  }, [apiKey, selectedModel]);

  // Carregar configurações centralizadas da API (do servidor / banco de dados)
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch('/api/ai/settings');
        if (res.ok) {
          const data = await res.json();
          let loadedKey = data.apiKey || '';
          let loadedModel = data.model || '';

          if (!loadedKey) {
            loadedKey = localStorage.getItem('gemini_api_key') || '';
            loadedModel = localStorage.getItem('gemini_selected_model') || '';
          }

          if (loadedKey) {
            setApiKey(loadedKey);
            fetchAvailableModels(loadedKey);
          }

          if (loadedModel) {
            setSelectedModel(loadedModel);
          } else {
            setSelectedModel('gemini-3.8-flash');
          }

          if (!loadedKey) setShowConfig(true);
        }
      } catch {
        const localKey = localStorage.getItem('gemini_api_key') || '';
        if (localKey) {
          setApiKey(localKey);
          fetchAvailableModels(localKey);
        }
      }
    }

    loadSettings();
  }, [fetchAvailableModels]);

  // Rolar para o final do chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Salvar configurações
  const handleSaveConfig = async () => {
    setSavingServer(true);
    setError(null);

    localStorage.setItem('gemini_api_key', apiKey.trim());
    localStorage.setItem('gemini_selected_model', selectedModel);

    try {
      const res = await fetch('/api/ai/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: selectedModel,
        }),
      });

      if (res.ok) {
        setConfigSaved(true);
        setTimeout(() => setConfigSaved(false), 3500);
      }
    } catch {
      setConfigSaved(true);
      setTimeout(() => setConfigSaved(false), 3500);
    } finally {
      setSavingServer(false);
    }
  };

  // Testar conexão da chave
  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: selectedModel,
          messages: [{ role: 'user', content: 'Responda apenas com a palavra OK se a API estiver funcionando.' }],
        }),
      });

      if (res.ok) {
        setTestStatus('success');
      } else {
        setTestStatus('failed');
      }
    } catch {
      setTestStatus('failed');
    }
  };

  // Enviar mensagem para o assistente
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessagesHistory = [...messages, userMsg];
    setMessages(newMessagesHistory);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Filtrar mensagem inicial local de boas-vindas para o Gemini receber histórico limpo começando em 'user'
      const historyToSend = newMessagesHistory
        .filter((m) => m.id !== 'welcome')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: apiKey.trim(),
          model: selectedModel,
          messages: historyToSend,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao obter resposta da IA.');
      }

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Falha ao conectar com o serviço de IA.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d1117] text-[#e6edf3]">
      {/* Top Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-[#30363d] bg-[#161b22] shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/30 flex items-center justify-center text-[#58a6ff]">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-[#e6edf3] font-semibold text-base flex items-center gap-2">
              Assistente Financeiro IA
              <span className="text-xs font-normal text-[#58a6ff] bg-[#58a6ff]/10 border border-[#58a6ff]/20 px-2 py-0.5 rounded-full">
                Google Gemini
              </span>
            </h1>
            <p className="text-[#8b949e] text-xs">
              Análise em tempo real dos seus saldos, faturas, metas e detecção de onde você está perdendo dinheiro
            </p>
          </div>
        </div>

        {/* Botão de abrir/fechar configurações */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] text-xs font-medium text-[#e6edf3] border border-[#30363d] transition-colors"
        >
          <Settings size={15} className="text-[#8b949e]" />
          <span>Configuração da API</span>
          {showConfig ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </header>

      {/* Seção de Configuração da API (Retrátil) */}
      {showConfig && (
        <div className="border-b border-[#30363d] bg-[#161b22] px-6 py-4 transition-all">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider flex items-center gap-2">
                <Key size={14} className="text-[#58a6ff]" />
                Configuração da API do Google Gemini
              </h2>
              {configSaved && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Configurações salvas para todos os seus dispositivos!
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Campo para API Key */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#e6edf3]">
                    Sua Chave de API (Gemini API Key):
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-[#58a6ff] hover:underline flex items-center gap-1"
                  >
                    Obter chave gratuita <ExternalLink size={10} />
                  </a>
                </div>
                <div className="flex gap-2">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none focus:border-[#58a6ff] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="px-3 py-2 bg-[#21262d] border border-[#30363d] rounded-lg text-xs text-[#8b949e] hover:text-[#e6edf3]"
                  >
                    {showApiKey ? 'Ocultar' : 'Mostrar'}
                  </button>
                </div>
                <p className="text-[11px] text-[#8b949e] flex items-center gap-1 pt-0.5">
                  <Smartphone size={12} className="text-[#58a6ff]" />
                  A chave é salva sincronizada no seu banco para funcionar no PC e celular.
                </p>
              </div>

              {/* Seletor de Modelo */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-[#e6edf3]">Modelo de IA:</label>
                  <button
                    type="button"
                    onClick={() => fetchAvailableModels()}
                    disabled={fetchingModels || !apiKey.trim()}
                    className="text-[11px] text-[#58a6ff] hover:underline disabled:opacity-50 flex items-center gap-1"
                  >
                    <RefreshCw size={11} className={fetchingModels ? 'animate-spin' : ''} />
                    Atualizar lista da minha chave
                  </button>
                </div>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-xs text-[#e6edf3] focus:outline-none focus:border-[#58a6ff]"
                >
                  {availableModels.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.description ? `— ${m.description}` : ''}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#8b949e]">
                  O modelo Flash (3.8 ou 3.6) é ultra rápido, inteligente e ideal para finanças.
                </p>
              </div>
            </div>

            {/* Ações de Salvar e Testar */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={savingServer}
                className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {savingServer && <Loader2 size={13} className="animate-spin" />}
                Salvar Configurações
              </button>
              <button
                onClick={handleTestConnection}
                disabled={!apiKey.trim() || testStatus === 'testing'}
                className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#e6edf3] px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {testStatus === 'testing' && <Loader2 size={13} className="animate-spin text-[#58a6ff]" />}
                Testar Conexão
              </button>

              {testStatus === 'success' && (
                <span className="text-xs text-green-400 flex items-center gap-1">
                  <CheckCircle2 size={14} /> Conexão estabelecida com sucesso!
                </span>
              )}
              {testStatus === 'failed' && (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} /> Falha na conexão. Verifique se a chave de API é válida.
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Container do Chat */}
      <div className="flex-1 flex flex-col min-h-0 max-w-4xl w-full mx-auto p-4 md:p-6 overflow-hidden">
        {/* Histórico de Mensagens */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/30 flex items-center justify-center text-[#58a6ff] shrink-0 mt-1">
                  <Bot size={18} />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl p-4 border ${
                  msg.role === 'user'
                    ? 'bg-[#21262d] border-[#30363d] text-[#e6edf3] rounded-br-none'
                    : 'bg-[#161b22] border-[#30363d] text-[#e6edf3] rounded-bl-none'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-[#30363d]/50 gap-4">
                  <span className="text-[11px] font-semibold text-[#8b949e]">
                    {msg.role === 'user' ? 'Você' : 'Assistente Gemini'}
                  </span>
                  <span className="text-[10px] text-[#8b949e]">{msg.timestamp}</span>
                </div>

                {msg.role === 'assistant' ? (
                  <MarkdownRenderer content={msg.content} />
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-green-400 shrink-0 mt-1">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-lg bg-[#58a6ff]/10 border border-[#58a6ff]/30 flex items-center justify-center text-[#58a6ff] shrink-0">
                <Bot size={18} />
              </div>
              <div className="bg-[#161b22] border border-[#30363d] rounded-xl rounded-bl-none p-4 flex items-center gap-3 text-xs text-[#8b949e]">
                <Loader2 size={16} className="animate-spin text-[#58a6ff]" />
                <span>Analisando suas contas, gastos e ralos de dinheiro para elaborar resposta...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Chips de Perguntas Sugeridas */}
        <div className="py-3 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff]/50 rounded-full text-xs text-[#8b949e] hover:text-[#e6edf3] whitespace-nowrap transition-colors disabled:opacity-50"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Campo de Entrada de Mensagem */}
        <div className="shrink-0 pt-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex gap-2 bg-[#161b22] border border-[#30363d] rounded-xl p-2 focus-within:border-[#58a6ff] transition-colors"
          >
            <input
              type="text"
              placeholder="Pergunte sobre seus gastos, faturas, onde está perdendo dinheiro..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isLoading}
              className="flex-1 bg-transparent px-3 py-2 text-sm text-[#e6edf3] placeholder:text-[#8b949e] focus:outline-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="bg-[#238636] hover:bg-[#2ea043] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
