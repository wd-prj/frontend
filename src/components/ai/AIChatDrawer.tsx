"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles,
  Send,
  Loader2,
  Bot,
  User as UserIcon,
  CheckCircle2,
  Calendar,
  Layers,
  HelpCircle,
} from "lucide-react";
import { Drawer } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/api";
import { AIChatResponse } from "@/lib/types";

interface MessageItem {
  id: string;
  role: "user" | "assistant";
  content: string;
  responseObj?: AIChatResponse;
}

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const STARTER_PROMPTS = [
  "Can I take leave from August 20 to August 25?",
  "How much leave balance do I have left?",
  "Which holidays apply to me in my location?",
  "What approval is required if I take 4 days off?",
];

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<MessageItem[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your AI Leave & Workforce Copilot. Ask me about your dynamic leave balances, holiday schedules, policy rules, or hypothetical time-off scenarios.",
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputMessage.trim();
    if (!query || isLoading) return;

    const userMsgId = Date.now().toString();
    const newMessages: MessageItem[] = [
      ...messages,
      { id: userMsgId, role: "user", content: query },
    ];

    setMessages(newMessages);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Build history
      const history = newMessages.slice(-6).map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await api.chatAI(query, history);

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: res.reply,
          responseObj: res,
        },
      ]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to query AI assistant";
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `⚠️ Error contacting leave agent: ${msg}`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="AI Leave & Policy Assistant"
      description="Grounded HR guidance backed by deterministic domain verification"
      width="xl"
    >
      <div className="flex flex-col h-full space-y-4">
        {/* Chat Message Feed */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {m.role === "assistant" && (
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 border border-indigo-200">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-indigo-600 text-white rounded-br-xs"
                    : "bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs"
                }`}
              >
                {/* Text Content */}
                <div className="whitespace-pre-wrap">{m.content}</div>

                {/* Grounded Tool Execution Badges */}
                {m.responseObj && m.responseObj.tool_calls_executed.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
                      <Layers className="w-3 h-3 text-indigo-500" />
                      Verified Domain Tools Executed:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {m.responseObj.tool_calls_executed.map((tc, idx) => (
                        <span
                          key={idx}
                          className="text-[11px] bg-white border border-slate-300 rounded px-2 py-0.5 font-mono text-slate-700 shadow-2xs"
                        >
                          {tc.tool_name}()
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {m.role === "user" && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
                  <UserIcon className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-200">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-xs p-4 text-xs text-slate-500 flex items-center gap-2">
                <span>Orchestrating deterministic HR tools & verifying policies...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Starter Prompts */}
        {messages.length <= 2 && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-xs font-medium text-slate-500 block">Suggested Inquiries:</span>
            <div className="grid grid-cols-1 gap-1.5">
              {STARTER_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(p)}
                  className="text-left text-xs bg-slate-50 hover:bg-indigo-50/70 hover:border-indigo-200 text-slate-700 p-2 rounded-lg border border-slate-200 transition-colors"
                >
                  💬 {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2 pt-2 border-t border-slate-200"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about policies, balances, or proposed leaves..."
            className="flex-1 rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            disabled={isLoading}
          />
          <Button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            isLoading={isLoading}
            className="shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Drawer>
  );
};
