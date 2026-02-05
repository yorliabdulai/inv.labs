"use client";

interface AtoSuggestionsProps {
    onSelect: (suggestion: string) => void;
}

const SUGGESTIONS = [
    { text: "Explain my portfolio 📊", prompt: "Explain my portfolio" },
    { text: "What are mutual funds? 💡", prompt: "What are mutual funds?" },
    { text: "How do I diversify? 🎓", prompt: "How do I diversify my portfolio?" },
    { text: "Stocks vs. mutual funds? 🤔", prompt: "What's the difference between stocks and mutual funds?" },
    { text: "Analyze my recent trades 📈", prompt: "Analyze my recent trades" },
    { text: "What is NAV? 📚", prompt: "What is NAV and how does it work?" },
];

export function AtoSuggestions({ onSelect }: AtoSuggestionsProps) {
    return (
        <div className="p-4 space-y-3">
            <div className="text-center mb-4">
                <h3 className="text-sm font-black text-gray-700 mb-1">Ask Ato anything! 🇬🇭</h3>
                <p className="text-xs text-gray-500">Here are some suggestions to get started:</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
                {SUGGESTIONS.map((suggestion, index) => (
                    <button
                        key={index}
                        onClick={() => onSelect(suggestion.prompt)}
                        className="px-3 py-3 bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 rounded-xl text-xs font-bold text-gray-700 transition-all hover:scale-105 hover:shadow-md text-left min-h-[52px] touch-manipulation active:scale-95"
                    >
                        {suggestion.text}
                    </button>
                ))}
            </div>

            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800 leading-relaxed">
                    <strong>💡 Tip:</strong> Ato can explain concepts, analyze your portfolio, and help you learn about investing in Ghana - but won't give financial advice!
                </p>
            </div>
        </div>
    );
}
