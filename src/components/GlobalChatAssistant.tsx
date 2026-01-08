import { ChatMessage, createChatSession, sendMessageToAssistant } from '../services/chatService';
import { Phase1Result, Phase2Result, Phase3Result, Phase4Result } from '../types';
import { ChatSession, Content } from "@google/generative-ai";
import { Bot, Loader2, Maximize2, MessageCircle, Minimize2, Send, Sparkles, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../utils/utils';
import { Project } from '../hooks/useProjects';

interface Props {
    appState: {
        phase1Data: Phase1Result | null;
        candidates: { name: string; fullPhase2: Phase2Result }[];
        shortlist: Phase3Result[];
        phase4Result: Phase4Result | null;
    };
    chatHistory: ChatMessage[];
    onHistoryChange: (history: ChatMessage[]) => void;
    projectId?: string;
    allProjects?: Project[];
}

const GlobalChatAssistant: React.FC<Props> = ({ appState, chatHistory, onHistoryChange, projectId, allProjects }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);

    // Use props for messages, but defaulting is handled by parent or here if empty
    const messages = chatHistory.length > 0 ? chatHistory : [
        { role: 'model', text: 'Olá! Sou o assistente Evermonte. Posso ajudar a analisar os candidatos, comparar perfis ou tirar dúvidas sobre o processo. O que deseja saber?' } as ChatMessage
    ];

    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [chatInstance, setChatInstance] = useState<ChatSession | null>(null);

    const messagesRef = useRef<ChatMessage[]>(messages);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    useEffect(() => {
        if (isOpen) {
            // Filter out the initial model greeting for the API history, as Gemini requires the first message to be from 'user'
            const apiHistory = messagesRef.current.filter((m, i) => i > 0 || m.role === 'user');

            const history: Content[] = apiHistory.map(m => ({
                role: m.role,
                parts: [{ text: m.text }]
            }));

            const chat = createChatSession(
                appState.phase1Data,
                appState.candidates,
                appState.shortlist,
                appState.phase4Result,
                history,
                projectId,
                allProjects
            );
            setChatInstance(chat);
        }
    }, [appState, isOpen]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput('');
        onHistoryChange([...messages, { role: 'user', text: userMsg }]);
        setLoading(true);

        try {
            let activeChat = chatInstance;
            if (!activeChat) {
                // Filter out the initial model greeting for the API history
                const apiHistory = messagesRef.current.filter((m, i) => i > 0 || m.role === 'user');

                const history: Content[] = apiHistory.map(m => ({
                    role: m.role,
                    parts: [{ text: m.text }]
                }));
                activeChat = createChatSession(
                    appState.phase1Data,
                    appState.candidates,
                    appState.shortlist,
                    appState.phase4Result,
                    history,
                    projectId,
                    allProjects
                );
                setChatInstance(activeChat);
            }

            const responseText = await sendMessageToAssistant(activeChat, userMsg, 'Global Chat Assistant');
            onHistoryChange([...messages, { role: 'user', text: userMsg }, { role: 'model', text: responseText }]);
        } catch (e) {
            onHistoryChange([...messages, { role: 'user', text: userMsg }, { role: 'model', text: "Erro de conexão com a IA." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const suggestions = [
        "Resuma a reunião de alinhamento",
        "Compare os candidatos finalistas",
        "Quais os riscos do Candidato 1?",
        "Quem tem melhor fit cultural?"
    ];

    const handleSuggestionClick = (text: string) => {
        setInput(text);
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-50 flex items-center gap-2 group border border-white/20"
            >
                <MessageCircle className="w-6 h-6" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-300 ease-in-out whitespace-nowrap font-medium">
                    AI-Headhunter
                </span>
            </button>
        );
    }

    return (
        <div
            className={cn(
                "fixed bottom-6 right-6 bg-card rounded-2xl shadow-2xl border border-border z-50 flex flex-col transition-all duration-300 overflow-hidden backdrop-blur-xl",
                isMinimized ? 'w-72 h-14' : 'w-96 h-[600px] max-h-[80vh]'
            )}
        >
            {/* Header */}
            <div className="bg-accent/50 p-4 flex justify-between items-center text-foreground shrink-0 cursor-pointer border-b border-border" onClick={() => !isMinimized && setIsMinimized(!isMinimized)}>
                <div className="flex items-center gap-2">
                    <div className="bg-gradient-to-tr from-indigo-500 to-purple-600 p-1.5 rounded-lg shadow-lg shadow-purple-500/20">
                        <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm leading-tight text-foreground">AI-Headhunter</h3>
                        <p className="text-[10px] text-muted-foreground">Powered by Gemini 3.0 Pro</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                        className="hover:bg-accent/50 p-1 rounded transition-colors text-muted-foreground hover:text-foreground"
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                        className="hover:bg-red-500/20 hover:text-red-500 p-1 rounded transition-colors text-muted-foreground"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 bg-accent/10 space-y-4 custom-scrollbar">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm",
                                        msg.role === 'user'
                                            ? 'bg-primary text-primary-foreground rounded-br-none'
                                            : 'bg-card text-foreground border border-border rounded-bl-none backdrop-blur-md'
                                    )}
                                >
                                    {msg.role === 'model' && (
                                        <div className="flex items-center gap-1 mb-1 opacity-50 text-[10px] font-bold uppercase tracking-wider text-primary">
                                            <Sparkles className="w-3 h-3" /> AI Analysis
                                        </div>
                                    )}
                                    <div className="prose prose-sm dark:prose-invert max-w-none leading-relaxed prose-p:my-1 prose-headings:mb-2 prose-headings:mt-4 prose-ul:my-2 prose-li:my-0.5">
                                        <ReactMarkdown>
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-card text-foreground border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2 backdrop-blur-md">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs text-muted-foreground">Analisando dados...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Suggestions Chips */}
                    {!loading && (
                        <div className="px-4 py-2 bg-accent/10 flex gap-2 overflow-x-auto no-scrollbar shrink-0 border-t border-border">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSuggestionClick(s)}
                                    className="whitespace-nowrap px-3 py-1.5 bg-card border border-border rounded-full text-xs text-primary hover:bg-accent hover:border-primary/30 transition-colors shadow-sm"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-3 bg-card border-t border-border shrink-0">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Pergunte sobre os candidatos..."
                                disabled={loading}
                                className="flex-1 bg-accent/20 border-transparent focus:bg-accent/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 rounded-xl px-4 py-2 text-sm transition-all outline-none text-foreground placeholder:text-muted-foreground"
                            />
                            <button
                                onClick={handleSend}
                                disabled={loading || !input.trim()}
                                className="bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-primary-foreground p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default GlobalChatAssistant;