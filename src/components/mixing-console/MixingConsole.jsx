import React from 'react';
import { Sliders, Volume2, Waves, Activity, Zap, Layers } from 'lucide-react';
import useStore from '../../store/useStore';

const MixingConsole = () => {
    const store = useStore();

    const Slider = ({ label, value, min, max, step, onChange, icon: Icon, unit = '' }) => (
        <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
                <div className="flex items-center gap-2 text-slate-400 text-xs font-medium uppercase tracking-wider">
                    {Icon && <Icon size={14} className="text-studio-primary" />}
                    {label}
                </div>
                <span className="text-studio-primary text-xs font-bold tabular-nums">
                    {value}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-white/5 rounded-lg appearance-none cursor-pointer accent-studio-primary"
            />
        </div>
    );

    return (
        <div className="flex flex-col gap-6 p-6 h-full overflow-y-auto custom-scrollbar">
            <div className="flex items-center gap-2 mb-2">
                <Sliders className="text-studio-primary" size={20} />
                <h2 className="text-lg font-bold text-white tracking-tight">Mixing Console</h2>
            </div>

            {/* Vocals Rack */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Layers size={16} className="text-studio-accent" /> Vocal Effects Rack
                </div>

                <Slider
                    label="Pitch Shift"
                    value={store.pitch}
                    min={-12} max={12} step={1}
                    onChange={store.setPitch}
                    icon={Activity}
                    unit=" st"
                />

                <Slider
                    label="Reverb Space"
                    value={store.reverbWet * 100}
                    min={0} max={100} step={1}
                    onChange={(val) => store.setReverbWet(val / 100)}
                    icon={Waves}
                    unit="%"
                />

                <Slider
                    label="Echo Delay"
                    value={store.delayWet * 100}
                    min={0} max={100} step={1}
                    onChange={(val) => store.setDelayWet(val / 100)}
                    icon={Zap}
                    unit="%"
                />
            </div>

            {/* EQ Rack */}
            <div className="space-y-6 p-5 rounded-2xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Activity size={16} className="text-studio-primary" /> Audio Equalizer
                </div>

                <Slider
                    label="Low Band"
                    value={store.eqLow}
                    min={-20} max={20} step={1}
                    onChange={(val) => store.setEq('Low', val)}
                    unit=" dB"
                />
                <Slider
                    label="Mid Range"
                    value={store.eqMid}
                    min={-20} max={20} step={1}
                    onChange={(val) => store.setEq('Mid', val)}
                    unit=" dB"
                />
                <Slider
                    label="High Band"
                    value={store.eqHigh}
                    min={-20} max={20} step={1}
                    onChange={(val) => store.setEq('High', val)}
                    unit=" dB"
                />
            </div>

            {/* Master Track */}
            <div className="mt-auto pt-4 space-y-6">
                <Slider
                    label="Master Tempo"
                    value={store.tempo}
                    min={0.5} max={1.5} step={0.01}
                    onChange={store.setTempo}
                    icon={Activity}
                    unit="x"
                />
                <Slider
                    label="Master Volume"
                    value={store.masterVolume}
                    min={-60} max={0} step={1}
                    onChange={store.setMasterVolume}
                    icon={Volume2}
                    unit=" dB"
                />
            </div>
        </div>
    );
};

export default MixingConsole;
