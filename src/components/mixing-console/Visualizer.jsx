import React, { useEffect, useRef } from 'react';
import * as Tone from 'tone';

const Visualizer = ({ analyzer }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!analyzer || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationId;

        const render = () => {
            const values = analyzer.getValue();
            const width = canvas.width;
            const height = canvas.height;

            ctx.clearRect(0, 0, width, height);

            const barWidth = (width / values.length) * 2.5;
            let barHeight;
            let x = 0;

            for (let i = 0; i < values.length; i++) {
                // Waveform normalization (values are usually between -1 and 1)
                barHeight = (values[i] + 1) * (height / 2);

                const gradient = ctx.createLinearGradient(0, height, 0, 0);
                gradient.addColorStop(0, '#5a189a');
                gradient.addColorStop(0.5, '#9d4edd');
                gradient.addColorStop(1, '#ff006e');

                ctx.fillStyle = gradient;
                ctx.fillRect(x, height - barHeight, barWidth, barHeight);

                x += barWidth + 2;
            }

            animationId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationId);
    }, [analyzer]);

    return (
        <div className="w-full h-full glass-panel rounded-3xl overflow-hidden relative">
            <canvas
                ref={canvasRef}
                className="w-full h-full opacity-80"
                width={800}
                height={300}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg-dark/40 to-transparent pointer-events-none" />
        </div>
    );
};

export default Visualizer;
