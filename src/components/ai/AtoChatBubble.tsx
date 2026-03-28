"use client";

import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface AtoChatBubbleProps {
    role: "user" | "assistant";
    content: string;
    timestamp?: string;
}

export function AtoChatBubble({ role, content, timestamp }: AtoChatBubbleProps) {
    const isUser = role === "user";

    return (
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"} mb-6 animate-fade-in`}>
            {/* Avatar */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border shadow-lg ${isUser
                ? "bg-muted border-border"
                : "bg-primary border-primary/30 shadow-primary/20"
                }`}>
                {isUser ? (
                    <User size={14} className="text-muted-foreground" />
                ) : (
                    <Bot size={14} className="text-white" />
                )}
            </div>

            {/* Message bubble */}
            <div className={`flex flex-col max-w-[calc(100%-44px)] ${isUser ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl shadow-premium transition-all hover:scale-[1.01] ${isUser
                    ? "bg-primary text-white border border-primary/30"
                    : "bg-muted/10 text-foreground border border-border backdrop-blur-md"
                    }`}>
                    {/* Render content with bespoke markdown support */}
                    <div className="text-xs md:text-sm leading-relaxed whitespace-pre-wrap break-words font-sans">
                        <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                                h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
                                h2: ({node, ...props}) => <h2 className="text-base font-bold mt-4 mb-2 text-foreground" {...props} />,
                                h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-3 mb-2 text-foreground" {...props} />,
                                h4: ({node, ...props}) => <h4 className="text-xs md:text-sm font-bold mt-3 mb-2 text-foreground uppercase tracking-wide" {...props} />,
                                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                                ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-3 space-y-1 marker:text-primary/70" {...props} />,
                                ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-3 space-y-1 marker:font-bold marker:text-primary/70" {...props} />,
                                li: ({node, ...props}) => <li className="pl-1" {...props} />,
                                table: ({node, ...props}) => <div className="overflow-x-auto my-3 rounded-lg border border-border"><table className="w-full text-left border-collapse text-xs" {...props} /></div>,
                                th: ({node, ...props}) => <th className="border-b border-border p-2 font-bold bg-muted/40 uppercase tracking-wider text-[10px]" {...props} />,
                                td: ({node, ...props}) => <td className="border-b border-border p-2 align-top" {...props} />,
                                strong: ({node, ...props}) => <strong className="font-bold text-foreground" {...props} />,
                                a: ({node, ...props}) => <a className="text-primary hover:underline font-medium" target="_blank" rel="noopener noreferrer" {...props} />,
                                blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-primary pl-3 py-1 my-2 bg-muted/10 italic text-muted-foreground rounded-r-lg" {...props} />,
                                code: ({node, inline, ...props}: any) => inline 
                                    ? <code className="bg-muted/50 text-primary px-1.5 py-0.5 rounded-md text-[11px] font-mono border border-border" {...props} /> 
                                    : <div className="overflow-x-auto my-2 rounded-lg border border-border bg-[#0d1117] p-3"><code className="text-[11px] font-mono text-zinc-300" {...props} /></div>
                            }}
                        >
                            {content}
                        </ReactMarkdown>
                    </div>
                </div>

                {/* Timestamp */}
                {timestamp && (
                    <span className="text-[9px] text-muted-foreground mt-2 px-1 uppercase tracking-widest font-bold">
                        {timestamp}
                    </span>
                )}
            </div>
        </div>
    );
}
