import React, { useState } from 'react';
import { Mic, Music, User, ArrowRight, Hash } from 'lucide-react';
import useStore from '../../store/useStore';
import { supabase } from '../../utils/supabaseClient';

const Lobby = () => {
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    const { joinRoom } = useStore();

    const handleJoin = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        let finalRoomCode = code.trim().toUpperCase();

        if (!finalRoomCode) {
            // Create a new room
            setIsCreating(true);
            finalRoomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

            if (supabase) {
                const { data: newRoom, error } = await supabase
                    .from('rooms')
                    .insert([{ room_code: finalRoomCode }])
                    .select()
                    .single();

                if (error || !newRoom) {
                    console.error("Error creating room", error);
                    alert(`Failed to create room: ${error?.message || "Database connection error"}`);
                    setIsCreating(false);
                    return;
                }
            } else {
                console.error("Supabase not available.");
                alert("Configuration Error: App is missing Supabase connection keys. Please check your Vercel Environment Variables.");
                setIsCreating(false);
                return;
            }
        }

        // Join room logic
        if (supabase) {
            const { data: roomData, error: joinError } = await supabase
                .from('rooms')
                .select('id')
                .eq('room_code', finalRoomCode)
                .single();

            if (joinError || !roomData) {
                console.error("Join error:", joinError);
                alert(joinError ? `Room error: ${joinError.message}` : "Room not found!");
                setIsCreating(false);
                return;
            }

            // Add participant
            const { data: partData, error: partError } = await supabase
                .from('participants')
                .insert([{
                    room_id: roomData.id,
                    user_name: name.trim()
                }])
                .select('id')
                .single();

            if (partError || !partData) {
                console.error("Participant error:", partError);
                alert(`Failed to join room: ${partError?.message || "Unknown error"}`);
                setIsCreating(false);
                return;
            }

            setParticipantId(partData.id);
        } else {
            alert("Configuration Error: Missing Supabase keys.");
            setIsCreating(false);
            return;
        }

        console.log("🚀 Connection Success!", {
            userName: name.trim(),
            roomCode: finalRoomCode,
            participantId: partData.id
        });

        joinRoom(name.trim(), finalRoomCode, partData.id);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-darker p-4">
            <div className="glass-panel w-full max-w-md p-8 rounded-3xl animate-in fade-in zoom-in duration-500">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="w-20 h-20 bg-gradient-to-tr from-studio-primary to-studio-accent rounded-2xl flex items-center justify-center shadow-lg shadow-studio-primary/20">
                        <Music className="text-white w-10 h-10" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white">VocalStudio Pro</h1>
                        <p className="text-slate-400">Collaborative Recording & Sync</p>
                    </div>

                    <form onSubmit={handleJoin} className="w-full space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Your Stage Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-studio-primary/50 transition-all placeholder:text-slate-600"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Room Code (Leave blank to create)"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-studio-primary/50 transition-all placeholder:text-slate-600 uppercase"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isCreating}
                            className="w-full bg-gradient-to-r from-studio-primary to-studio-secondary hover:from-studio-secondary hover:to-studio-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 group transition-all shadow-lg shadow-studio-primary/20 disabled:opacity-50"
                        >
                            {isCreating ? 'Creating Studio...' : code.trim() ? 'Join Studio' : 'Launch New Studio'}
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </form>

                    <div className="pt-4 flex gap-4 text-sm text-slate-500">
                        <div className="flex items-center gap-1.5 border border-white/5 px-3 py-1 rounded-full">
                            <Mic className="w-4 h-4" /> 44.1kHz
                        </div>
                        <div className="flex items-center gap-1.5 border border-white/5 px-3 py-1 rounded-full">
                            <Music className="w-4 h-4" /> Real-time Sync
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
