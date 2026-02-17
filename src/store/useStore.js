import { create } from 'zustand';

const useStore = create((set) => ({
    // Lobby & Sync State
    roomCode: null,
    user: null,
    participantId: null,
    participants: [],
    setUser: (name) => set({ user: { name, role: 'Vocalist', isRecording: false } }),
    setRoomCode: (code) => set({ roomCode: code }),
    setParticipantId: (id) => set({ participantId: id }),
    setParticipants: (newParticipants) => set({ participants: newParticipants }),

    // Audio Engine State
    masterVolume: -10,
    isMicEnabled: false,
    isBackingTrackLoaded: false,
    isPlaying: false,
    pitch: 0,
    tempo: 1.0,

    // Effects Level
    reverbWet: 0.3,
    delayWet: 0.2,
    eqLow: 0,
    eqMid: 0,
    eqHigh: 0,

    // Setters
    setMasterVolume: (val) => set({ masterVolume: val }),
    setMicEnabled: (bool) => set({ isMicEnabled: bool }),
    setBackingTrackLoaded: (bool) => set({ isBackingTrackLoaded: bool }),
    setIsPlaying: (bool) => set({ isPlaying: bool }),
    setPitch: (val) => set({ pitch: val }),
    setTempo: (val) => set({ tempo: val }),
    setReverbWet: (val) => set({ reverbWet: val }),
    setDelayWet: (val) => set({ delayWet: val }),
    setEq: (band, val) => set((state) => ({ [`eq${band}`]: val })),
}));

export default useStore;
