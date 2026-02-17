import React from 'react';
import { Play, Pause, Mic, Users, Settings, Share2, Upload, Radio, Copy } from 'lucide-react';
import useStore from '../store/useStore';
import { useAudioEngine } from '../hooks/useAudioEngine';
import MixingConsole from './mixing-console/MixingConsole';
import Visualizer from './mixing-console/Visualizer';
import LyricsSystem from './lyrics/LyricsSystem';

import { supabase } from '../utils/supabaseClient';

const Studio = () => {
    const store = useStore();
    const { startMic, loadBackingTrack, togglePlayback, seek, currentTime, duration, analyzer } = useAudioEngine();

    // Fetch and subscribe to participants
    React.useEffect(() => {
        if (!store.roomCode || !supabase) return;

        const fetchParticipants = async () => {
            const { data: roomData, error: roomError } = await supabase
                .from('rooms')
                .select('id')
                .eq('room_code', store.roomCode)
                .single();

            if (roomError) {
                console.error("Error fetching room:", roomError);
                return;
            }

            if (roomData) {
                const { data: participants, error: partError } = await supabase
                    .from('participants')
                    .select('*')
                    .eq('room_id', roomData.id);

                if (partError) {
                    console.error("Error fetching participants:", partError);
                } else if (participants) {
                    store.setParticipants(participants.map(p => ({
                        id: p.id,
                        name: p.user_name,
                        role: p.role,
                        isRecording: false // Could be synced later
                    })));
                }

                // Subscribe to changes
                const channel = supabase
                    .channel(`participants:${roomData.id}`)
                    .on('postgres_changes', {
                        event: '*',
                        schema: 'public',
                        table: 'participants',
                        filter: `room_id=eq.${roomData.id}`
                    }, async () => {
                        // Re-fetch on any change for simplicity
                        const { data: updated } = await supabase
                            .from('participants')
                            .select('*')
                            .eq('room_id', roomData.id);

                        if (updated) {
                            store.setParticipants(updated.map(p => ({
                                id: p.id,
                                name: p.user_name,
                                role: p.role,
                                isRecording: false
                            })));
                        }
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        };

        const cleanupPromise = fetchParticipants();
        return () => {
            cleanupPromise.then(cleanup => cleanup && cleanup());
        };
    }, [store.roomCode]);

    const handleStartMic = async () => {
        await startMic();
        store.setMicEnabled(true);
    };

    const onFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            loadBackingTrack(url);
            store.setBackingTrackLoaded(true);
        }
    };

    const handleSeek = (e) => {
        const newTime = parseFloat(e.target.value);
        seek(newTime);
    };

    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = Math.floor(seconds % 60);
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const copyRoomCode = () => {
        navigator.clipboard.writeText(store.roomCode);
        alert("Room Code copied!");
    };

    return (
        <div className="flex h-screen bg-bg-darker overflow-hidden font-sans text-slate-200">
            {/* Sidebar - Participant List */}
            <aside className="w-16 lg:w-72 border-r border-white/5 bg-bg-dark/50 backdrop-blur-md flex flex-col">
                <div className="p-4 lg:p-6 border-b border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-studio-primary to-studio-accent flex items-center justify-center shrink-0 shadow-lg shadow-studio-primary/20">
                        <Radio className="text-white" size={20} />
                    </div>
                    <span className="hidden lg:block font-bold text-lg tracking-tight text-white">VocalFlow</span>
                </div>

                <div className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto mt-4">
                    <div className="space-y-4">
                        <h3 className="hidden lg:flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-widest">
                            <div className="flex items-center gap-2"><Users size={14} /> Participants</div>
                            <span className="text-[10px] text-studio-primary capitalize">Live Sync</span>
                        </h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-2 rounded-xl bg-studio-primary/10 border border-studio-primary/20">
                                <div className="w-8 h-8 rounded-full bg-studio-primary flex items-center justify-center text-[10px] font-bold text-white uppercase ring-2 ring-studio-primary/30">
                                    {store.user?.name.slice(0, 2)}
                                </div>
                                <div className="hidden lg:block min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{store.user?.name} (You)</p>
                                    <p className="text-[10px] text-studio-primary font-medium animate-pulse">Monitoring</p>
                                </div>
                            </div>

                            {store.participants.map(p => (
                                <div key={p.id} className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-transparent hover:border-white/5 transition-colors">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase">
                                        {p.name.slice(0, 2)}
                                    </div>
                                    <div className="hidden lg:block">
                                        <p className="text-sm font-bold text-slate-300">{p.name}</p>
                                        <p className="text-[10px] text-slate-500 font-medium">{p.isRecording ? 'Singing' : 'Listening'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="p-4 lg:p-6 border-t border-white/5 space-y-4">
                    <div className="bg-white/5 rounded-xl p-3 flex flex-col gap-2">
                        <p className="text-[10px] font-bold text-slate-500 uppercase">Room Code</p>
                        <div className="flex items-center justify-between">
                            <span className="text-white font-mono font-bold tracking-widest">{store.roomCode}</span>
                            <button onClick={copyRoomCode} className="text-slate-500 hover:text-white transition-colors">
                                <Copy size={16} />
                            </button>
                        </div>
                    </div>
                    <button className="w-full bg-studio-primary/20 hover:bg-studio-primary/30 text-studio-primary rounded-xl py-3 px-4 flex items-center justify-center gap-2 transition-all group border border-studio-primary/30">
                        <Share2 size={18} className="group-hover:text-studio-accent transition-colors" />
                        <span className="hidden lg:block text-sm font-bold">Invite Peers</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col relative min-w-0">
                {/* Top Header */}
                <header className="h-20 border-b border-white/5 flex items-center justify-between px-6 lg:px-10 bg-bg-dark/20">
                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${store.isPlaying ? 'bg-red-500 animate-pulse' : 'bg-slate-700'}`} />
                            <span className="text-xs font-black text-slate-400 uppercase tracking-widest tabular-nums">
                                {formatTime(currentTime)}
                            </span>
                        </div>

                        <label className="flex items-center gap-2 text-xs font-bold text-studio-primary hover:text-studio-accent cursor-pointer transition-colors group">
                            <Upload size={16} className="group-hover:scale-110 transition-transform" />
                            <span>LOAD BACKING TRACK</span>
                            <input type="file" accept="audio/*" onChange={onFileUpload} className="hidden" />
                        </label>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleStartMic}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm transition-all ${store.isMicEnabled
                                ? 'bg-studio-accent text-white shadow-lg shadow-studio-accent/20'
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                }`}
                        >
                            <Mic size={18} /> {store.isMicEnabled ? 'MIC LIVE' : 'ENABLE MIC'}
                        </button>
                        <button className="p-2 text-slate-500 hover:text-white transition-colors">
                            <Settings size={20} />
                        </button>
                    </div>
                </header>

                {/* Studio Body */}
                <div className="flex-1 overflow-hidden flex flex-col p-6 lg:p-10 space-y-8">
                    <div className="flex-1 min-h-0 flex flex-col space-y-8">
                        {/* Lyrics Section */}
                        <div className="flex-1 min-h-0">
                            <LyricsSystem currentTime={currentTime} />
                        </div>

                        {/* Visualizer Section */}
                        <div className="h-32 lg:h-48 shrink-0">
                            <Visualizer analyzer={analyzer} />
                        </div>
                    </div>

                    {/* Bottom Controls */}
                    <div className="h-max glass-panel rounded-3xl shrink-0 flex flex-col p-6 gap-4">
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => togglePlayback(store.isPlaying)}
                                disabled={!store.isBackingTrackLoaded}
                                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shrink-0 ${!store.isBackingTrackLoaded
                                    ? 'bg-slate-800 text-slate-600 cursor-not-allowed'
                                    : 'bg-studio-primary hover:bg-studio-secondary text-white shadow-lg shadow-studio-primary/20 active:scale-95'
                                    }`}
                            >
                                {store.isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
                            </button>

                            <div className="flex-1 flex flex-col gap-2">
                                <div className="flex justify-between text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                    <span>{store.isBackingTrackLoaded ? 'Now Syncing: Local_Track.mp3' : 'No track loaded (Local-Only)'}</span>
                                    <div className="flex gap-4">
                                        <span className="text-slate-400 tabular-nums">{formatTime(currentTime)} / {formatTime(duration)}</span>
                                        <span className="text-studio-primary underline">ZERO-COST HOSTING ACTIVE</span>
                                    </div>
                                </div>
                                <div className="relative group py-2">
                                    <input
                                        type="range"
                                        min="0"
                                        max={duration || 100}
                                        step="0.1"
                                        value={currentTime}
                                        onChange={handleSeek}
                                        disabled={!store.isBackingTrackLoaded}
                                        className="w-full h-1.5 bg-white/5 rounded-full appearance-none cursor-pointer accent-studio-primary hover:accent-studio-accent transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                                        style={{
                                            background: `linear-gradient(to right, #9d4edd ${(currentTime / (duration || 100)) * 100}%, rgba(255,255,255,0.05) ${(currentTime / (duration || 100)) * 100}%)`
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="hidden md:flex items-center gap-6 shrink-0">
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Scale</p>
                                    <p className="text-lg font-black text-white leading-none capitalize">C Major</p>
                                </div>
                                <div className="w-px h-8 bg-white/5" />
                                <div className="text-center">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Sync</p>
                                    <p className="text-lg font-black text-studio-accent leading-none">RT-DB</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Right Sidebar - Mixing Console */}
            <aside className="hidden xl:flex w-80 border-l border-white/5 bg-bg-dark/50 backdrop-blur-md flex-col">
                <MixingConsole />
            </aside>
        </div>
    );
};

export default Studio;
