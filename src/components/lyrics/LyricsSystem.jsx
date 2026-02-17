import React, { useState, useEffect } from 'react';
import { Music, FileText } from 'lucide-react';

const LyricsSystem = ({ currentTime = 0 }) => {
    const [lyrics, setLyrics] = useState([
        { time: 0, text: "Welcome to your Studio session" },
        { time: 4, text: "Ready to record your next hit?" },
        { time: 8, text: "Adjust effects in the console" },
        { time: 12, text: "Synthesize. Collaborate. Perform." },
    ]);

    const activeIndex = lyrics.findLastIndex(l => currentTime >= l.time);

    return (
        <div className="flex flex-col h-full space-y-4">
            <div className="flex items-center justify-between text-slate-400">
                <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-widest">
                    <FileText size={16} /> Lyrics Display
                </div>
                <button className="text-xs hover:text-studio-primary transition-colors flex items-center gap-1">
                    <Music size={12} /> Upload .lrc
                </button>
            </div>

            <div className="flex-1 glass-panel rounded-3xl p-8 flex items-center justify-center text-center overflow-hidden">
                <div className="space-y-8">
                    {lyrics.map((line, i) => {
                        const isActive = i === activeIndex;
                        const isUpcoming = i > activeIndex && i <= activeIndex + 1;
                        const isPast = i < activeIndex;

                        if (!isActive && !isUpcoming) return null;

                        return (
                            <div
                                key={i}
                                className={`transition-all duration-700 ${isActive
                                        ? 'text-4xl md:text-5xl font-black text-white scale-100 opacity-100 blur-0'
                                        : 'text-2xl md:text-3xl font-bold text-slate-500 scale-90 opacity-40 blur-sm'
                                    }`}
                            >
                                {line.text}
                            </div>
                        );
                    })}

                    {activeIndex === -1 && (
                        <div className="text-slate-600 animate-pulse font-medium italic">
                            Waiting for track to start...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LyricsSystem;
