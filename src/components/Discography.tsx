'use client';
import React, { useState, useMemo } from 'react';
import { SiSpotify, SiSoundcloud, SiYoutube } from 'react-icons/si';
import { MdContentCopy, MdCheck } from 'react-icons/md'; // Added copy icons
import { discography, Track, Platform } from '../config/music.config';

const PlatformIcon = ({ platform, className, style }: { platform: Platform; className?: string; style?: React.CSSProperties }) => {
    switch (platform) {
        case 'Spotify': return <SiSpotify aria-hidden="true" className={className} style={style} />;
        case 'SoundCloud': return <SiSoundcloud aria-hidden="true" className={className} style={style} />;
        case 'YouTube': return <SiYoutube aria-hidden="true" className={className} style={style} />;
        default: return null;
    }
};

export default function Discography() {
    const [activeTrack, setActiveTrack] = useState<Track | undefined>(discography[0]);
    const [copied, setCopied] = useState(false);

    const platformColors: Record<Platform, string> = {
        Spotify: '#1DB954',
        SoundCloud: '#FF5500',
        YouTube: '#FF0000'
    };

    const activeColor = activeTrack ? platformColors[activeTrack.platform] : '#666';

    const handleCopy = async () => {
        if (!activeTrack) return;
        try {
            await navigator.clipboard.writeText(activeTrack.url);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    const embedUrl = useMemo(() => {
        if (!activeTrack) return '';
        const url = activeTrack.url;
        if (activeTrack.platform === 'Spotify') {
            return url.includes('/embed') ? url : url.replace('open.spotify.com/', 'open.spotify.com/embed/');
        }
        if (activeTrack.platform === 'YouTube') {
            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
            const match = url.match(regExp);
            const videoId = (match && match[2].length === 11) ? match[2] : null;
            return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
        }
        if (activeTrack.platform === 'SoundCloud') {
            return `https://w.soundcloud.com/player/?url=${encodeURIComponent(url)}&color=%23ff5500&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false`;
        }
        return url;
    }, [activeTrack]);

    if (!activeTrack) return null;

    return (
        <div className="flex flex-col gap-6 px-4 py-6 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.80)] font-mono relative overflow-hidden">
            {/* Ambient Glow */}
            <div
                className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 blur-[120px] pointer-events-none transition-colors duration-1000"
                style={{ backgroundColor: activeColor }}
            />

            {/* HEADER */}
            <div className="flex justify-between items-center border-b border-[var(--terminal-border)] pb-4 mb-2 relative z-10">
                <h2 className="text-xl font-bold tracking-tighter text-[var(--terminal-text)] flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: activeColor }} />
                    DISCOGRAPHY
                </h2>
                <div className="hidden sm:block text-[10px] text-[var(--terminal-text-muted)] uppercase tracking-[0.2em]">
                    Active: <span style={{ color: activeColor }}>{activeTrack.platform}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                {/* LEFT: LIST */}
                <div className="lg:col-span-5 flex flex-col gap-2">
                    <div className="flex justify-between px-1">
                        <p className="text-[10px] font-bold text-[var(--terminal-text)]/40 uppercase tracking-widest">Index</p>
                        <p className="text-[10px] font-bold text-[var(--terminal-text)]/40 uppercase tracking-widest">Entry_Point</p>
                    </div>

                    <div className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                        {discography.map((track) => {
                            const isSelected = activeTrack.id === track.id;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => { setActiveTrack(track); setCopied(false); }}
                                    className={`flex items-center justify-between p-3 border transition-all active:scale-[0.98] text-left group rounded w-full
                                        ${isSelected
                                        ? 'bg-[rgba(var(--terminal-text-rgb),0.10)] border-[rgba(var(--terminal-text-rgb),0.20)]'
                                        : 'bg-transparent border-[rgba(var(--terminal-text-rgb),0.5)] hover:border-[rgba(var(--terminal-text-rgb),0.10)]'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <PlatformIcon
                                            platform={track.platform}
                                            className="text-lg flex-shrink-0 transition-colors"
                                            style={{ color: isSelected ? platformColors[track.platform] : '#333' }}
                                        />
                                        <div className="truncate">
                                            <div className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-[var(--terminal-text)]' : 'text-[var(--terminal-text)]/40'}`}>
                                                {track.title}
                                            </div>
                                            <div className="text-[9px] text-[var(--terminal-text-muted)] italic truncate">{track.category}</div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <span className="text-[8px] font-bold px-1.5 py-0.5 border border-current rounded animate-pulse whitespace-nowrap ml-2" style={{ color: activeColor }}>
                                            STREAMING
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* RIGHT: PLAYER */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="relative group rounded-xl overflow-hidden border border-[rgba(var(--terminal-text-rgb),0.10)] shadow-2xl bg-[#111]">
                        <iframe
                            key={activeTrack.id}
                            title={`${activeTrack.platform} player — ${activeTrack.title}`}
                            src={embedUrl}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="transition-all duration-700 opacity-90 group-hover:opacity-100"
                        ></iframe>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* THE NEW COPY LINK COMPONENT */}
                        <button
                            onClick={handleCopy}
                            className="p-3 border border-[rgba(var(--terminal-text-rgb),0.5)] bg-[rgba(var(--terminal-text-rgb),0.05)] rounded flex flex-col justify-center text-left hover:bg-[rgba(var(--terminal-text-rgb),0.10)] hover:border-[rgba(var(--terminal-text-rgb),0.20)] active:scale-[0.98] transition-all group"
                        >
                            <span className="text-[8px] text-[var(--terminal-text-muted)] block uppercase mb-1">
                                {copied ? 'Success' : 'Share_Stream'}
                            </span>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {copied ? (
                                        <MdCheck className="text-xs" style={{ color: activeColor }} />
                                    ) : (
                                        <MdContentCopy className="text-xs group-hover:text-[var(--terminal-text)] transition-colors" style={{ color: activeColor }} />
                                    )}
                                    <span className={`text-[10px] font-bold uppercase transition-colors ${copied ? 'text-[var(--terminal-text)]' : 'text-[var(--terminal-text)]/80 group-hover:text-[var(--terminal-text)]'}`}>
                                        {copied ? 'Link_Copied' : 'Copy_Link'}
                                    </span>
                                </div>
                            </div>
                        </button>

                        <div className="p-3 border border-[rgba(var(--terminal-text-rgb),0.5)] bg-[rgba(var(--terminal-text-rgb),0.05)] rounded flex flex-col justify-center">
                            <span className="text-[8px] text-[var(--terminal-text-muted)] block uppercase mb-1">Object_ID</span>
                            <span className="text-[10px] text-[var(--terminal-text)] font-bold tracking-widest uppercase">
                                TRK_{activeTrack.id.padStart(3, '0')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.02); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: ${activeColor}44; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: ${activeColor}aa; }
            `}</style>
        </div>
    );
}