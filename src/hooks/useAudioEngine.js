import { useEffect, useRef, useState } from 'react';
import * as Tone from 'tone';
import useStore from '../store/useStore';
import { supabase } from '../utils/supabaseClient';

export const useAudioEngine = () => {
    const {
        masterVolume,
        isMicEnabled,
        pitch,
        tempo,
        reverbWet,
        delayWet,
        eqLow,
        eqMid,
        eqHigh,
        roomCode,
        setIsPlaying
    } = useStore();

    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    const micRef = useRef(null);
    const playerRef = useRef(null);
    const pitchShiftRef = useRef(null);
    const reverbRef = useRef(null);
    const feedbackDelayRef = useRef(null);
    const eqRef = useRef(null);
    const analyzerRef = useRef(null);
    const progressIntervalRef = useRef(null);

    useEffect(() => {
        // Initialize Effects Chain
        reverbRef.current = new Tone.Reverb({ decay: 2, wet: reverbWet }).toDestination();
        feedbackDelayRef.current = new Tone.FeedbackDelay("8n", delayWet).connect(reverbRef.current);
        eqRef.current = new Tone.EQ3(eqLow, eqMid, eqHigh).connect(feedbackDelayRef.current);
        pitchShiftRef.current = new Tone.PitchShift(pitch).connect(eqRef.current);

        analyzerRef.current = new Tone.Analyser("waveform", 256);
        Tone.Destination.connect(analyzerRef.current);

        return () => {
            reverbRef.current?.dispose();
            feedbackDelayRef.current?.dispose();
            eqRef.current?.dispose();
            pitchShiftRef.current?.dispose();
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, []);

    // Progress tracking
    useEffect(() => {
        if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

        progressIntervalRef.current = setInterval(() => {
            if (playerRef.current && playerRef.current.state === "started") {
                // Tone.js player.seconds is problematic for Granular players but works for standard Player 
                // when adjusted by the transport or offset.
                setCurrentTime(playerRef.current.buffer.duration ? playerRef.current.now() - playerRef.current._startTime : 0);
            }
        }, 100);

        return () => clearInterval(progressIntervalRef.current);
    }, []);

    // Real-time listener for Play/Pause and Seek sync
    useEffect(() => {
        if (!roomCode || !supabase) return;

        const channel = supabase
            .channel(`room:${roomCode}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'rooms',
                filter: `room_code=eq.${roomCode}`
            }, (payload) => {
                const { playing, currentTime: newTime } = payload.new.current_song_status;

                if (playerRef.current) {
                    // Sync playback state
                    if (playing && playerRef.current.state !== "started") {
                        playerRef.current.start(undefined, newTime);
                        setIsPlaying(true);
                    } else if (!playing && playerRef.current.state === "started") {
                        playerRef.current.stop();
                        setIsPlaying(false);
                    }

                    // Sync time if difference is significant (> 1s)
                    const localTime = playerRef.current.buffer.duration ? playerRef.current.now() - playerRef.current._startTime : 0;
                    const diff = Math.abs(localTime - newTime);

                    if (playing && diff > 1) {
                        playerRef.current.stop();
                        playerRef.current.start(undefined, newTime);
                    }

                    if (!playing) {
                        setCurrentTime(newTime);
                    }
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [roomCode]); // Removed currentTime from dependencies!

    useEffect(() => {
        if (reverbRef.current) reverbRef.current.wet.value = reverbWet;
        if (feedbackDelayRef.current) feedbackDelayRef.current.wet.value = delayWet;
        if (pitchShiftRef.current) pitchShiftRef.current.pitch = pitch;
        if (eqRef.current) {
            eqRef.current.low.value = eqLow;
            eqRef.current.mid.value = eqMid;
            eqRef.current.high.value = eqHigh;
        }
        Tone.Destination.volume.value = masterVolume;
    }, [reverbWet, delayWet, pitch, eqLow, eqMid, eqHigh, masterVolume]);

    const startMic = async () => {
        await Tone.start();
        if (!micRef.current) {
            micRef.current = new Tone.UserMedia();
            try {
                await micRef.current.open();
                micRef.current.connect(pitchShiftRef.current);
            } catch (e) {
                console.error("Mic access denied", e);
            }
        }
    };

    const loadBackingTrack = async (blobUrl) => {
        if (playerRef.current) playerRef.current.dispose();

        const buffer = await new Tone.ToneAudioBuffer().load(blobUrl);
        playerRef.current = new Tone.Player(buffer).toDestination();
        playerRef.current.playbackRate = tempo;
        setDuration(buffer.duration);
    };

    const togglePlayback = async (currentlyPlaying) => {
        if (!playerRef.current) return;

        const newState = !currentlyPlaying;
        const time = currentTime;

        // Update Supabase to notify others
        if (roomCode && supabase) {
            await supabase
                .from('rooms')
                .update({
                    current_song_status: {
                        playing: newState,
                        currentTime: time
                    }
                })
                .eq('room_code', roomCode);
        } else {
            // Local only if no room
            if (newState) {
                playerRef.current.start(undefined, currentTime);
            } else {
                playerRef.current.stop();
            }
            setIsPlaying(newState);
        }
    };

    const seek = async (newTime) => {
        if (!playerRef.current) return;

        const isPlaying = playerRef.current.state === "started";

        if (roomCode && supabase) {
            await supabase
                .from('rooms')
                .update({
                    current_song_status: {
                        playing: isPlaying,
                        currentTime: newTime
                    }
                })
                .eq('room_code', roomCode);
        } else {
            if (isPlaying) {
                playerRef.current.stop();
                playerRef.current.start(undefined, newTime);
            }
            setCurrentTime(newTime);
        }
    };

    useEffect(() => {
        if (playerRef.current) playerRef.current.playbackRate = tempo;
    }, [tempo]);

    return {
        startMic,
        loadBackingTrack,
        togglePlayback,
        seek,
        currentTime,
        duration,
        analyzer: analyzerRef.current
    };
};
