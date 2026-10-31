'use client';
import React, { useState, useMemo } from 'react';
import { SiSpotify, SiSoundcloud, SiYoutube } from 'react-icons/si';
import { MdContentCopy, MdCheck } from 'react-icons/md';
import { discography, Track, Platform } from '../config/music.config';
import Reveal from './Reveal';
import TypedText from './TypedText';
import { copyText } from '@/lib/copy-text';
import { eventProps, track } from '@/lib/track';

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
    // The embed pulls in the platform's whole player (over 1 MB for SoundCloud) and its cookies, so it waits for a click.
    const [playerLoaded, setPlayerLoaded] = useState(false);

    const platformColors: Record<Platform, string> = {
        Spotify: '#1DB954',
        SoundCloud: '#FF5500',
        YouTube: '#FF0000'
    };

    const activeColor = activeTrack ? platformColors[activeTrack.platform] : '#666';

    const handleCopy = async () => {
        if (!activeTrack) return;
        if (await copyText(activeTrack.url)) {
            track('track_link_copy', { track: activeTrack.id });
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } else {
            console.error('Failed to copy the track link');
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
        <Reveal draw className="flex flex-col gap-6 px-4 py-6 border border-[var(--terminal-border)] rounded bg-[rgba(var(--terminal-bg-rgb),0.80)] font-mono relative overflow-hidden">
            <div
                className="absolute top-0 right-0 w-[400px] h-[400px] opacity-10 blur-[120px] pointer-events-none transition-colors duration-300"
                style={{ backgroundColor: activeColor }}
            />

            <div className="flex justify-between items-center border-b border-[var(--terminal-border)] pb-4 mb-2 relative z-10">
                <h2 className="text-xl font-bold tracking-tighter text-[var(--terminal-text)] flex items-center gap-2">
                    <TypedText text="DISCOGRAPHY" />
                </h2>
                <div className="hidden sm:block text-xs text-[var(--terminal-text-muted)] uppercase tracking-[0.2em]">
                    Active: <span style={{ color: activeColor }}>{activeTrack.platform}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

                <div className="lg:col-span-5 flex flex-col gap-2">
                    <div className="flex justify-between px-1">
                        <p className="text-xs font-bold text-[var(--terminal-text)]/40 uppercase tracking-widest">Index</p>
                        <p className="text-xs font-bold text-[var(--terminal-text)]/40 uppercase tracking-widest">Entry_Point</p>
                    </div>

                    <div data-lenis-prevent className="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar overflow-x-hidden">
                        {discography.map((track) => {
                            const isSelected = activeTrack.id === track.id;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => { setActiveTrack(track); setCopied(false); setPlayerLoaded(true); }}
                                    {...eventProps('track_select', { track: track.id, platform: track.platform })}
                                    className={`flex items-center justify-between p-3 border transition active:scale-[0.98] text-left group rounded w-full
                                        ${isSelected
                                        ? 'bg-[rgba(var(--terminal-text-rgb),0.10)] border-[rgba(var(--terminal-text-rgb),0.20)]'
                                        : 'bg-transparent border-[rgba(var(--terminal-text-rgb),0.5)] hover:border-[rgba(var(--terminal-text-rgb),0.10)]'}`}
                                >
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <PlatformIcon
                                            platform={track.platform}
                                            className="text-lg flex-shrink-0 transition-colors"
                                            style={{ color: isSelected ? platformColors[track.platform] : 'rgba(var(--terminal-text-rgb), 0.4)' }}
                                        />
                                        <div className="truncate">
                                            <div className={`text-xs font-bold uppercase truncate ${isSelected ? 'text-[var(--terminal-text)]' : 'text-[var(--terminal-text)]/40'}`}>
                                                {track.title}
                                            </div>
                                            <div className="text-xs text-[var(--terminal-text-muted)] italic truncate">{track.category}</div>
                                        </div>
                                    </div>
                                    {isSelected && (
                                        <span className="text-xs font-bold px-1.5 py-0.5 border border-current rounded animate-pulse whitespace-nowrap ml-2" style={{ color: activeColor }}>
                                            STREAMING
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-7 flex flex-col gap-4">
                    <div className="relative group rounded-xl overflow-hidden border border-[rgba(var(--terminal-text-rgb),0.10)] shadow-2xl bg-[#111]">
                        {playerLoaded ? (
                        <iframe
                            key={activeTrack.id}
                            title={`${activeTrack.platform} player | ${activeTrack.title}`}
                            src={embedUrl}
                            width="100%"
                            height="352"
                            frameBorder="0"
                            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                            loading="lazy"
                            className="transition-opacity duration-200 opacity-90 group-hover:opacity-100"
                        ></iframe>
                        ) : (
                            <button
                                type="button"
                                onClick={() => setPlayerLoaded(true)}
                                {...eventProps('player_load', { track: activeTrack.id, platform: activeTrack.platform })}
                                aria-label={`Load the ${activeTrack.platform} player for ${activeTrack.title}`}
                                className="flex h-[352px] w-full flex-col items-center justify-center gap-3 px-4 text-center transition-colors hover:bg-[rgba(var(--terminal-text-rgb),0.05)]"
                            >
                                <PlatformIcon platform={activeTrack.platform} className="text-4xl" style={{ color: activeColor }} />
                                <span className="text-sm font-bold uppercase text-[var(--terminal-text)]">{activeTrack.title}</span>
                                <span className="text-xs uppercase tracking-widest" style={{ color: activeColor }}>&gt; Load_Player</span>
                                <span className="max-w-xs text-xs text-[var(--terminal-text-muted)]">Loads content from {activeTrack.platform}, which can set its own cookies.</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <button
                            onClick={handleCopy}
                            className="p-3 border border-[rgba(var(--terminal-text-rgb),0.5)] bg-[rgba(var(--terminal-text-rgb),0.05)] rounded flex flex-col justify-center text-left hover:bg-[rgba(var(--terminal-text-rgb),0.10)] hover:border-[rgba(var(--terminal-text-rgb),0.20)] active:scale-[0.98] transition group"
                        >
                            <span className="text-xs text-[var(--terminal-text-muted)] block uppercase mb-1">
                                {copied ? 'Success' : 'Share_Stream'}
                            </span>
                            <div className="flex items-center justify-between w-full">
                                <div className="flex items-center gap-2">
                                    {copied ? (
                                        <MdCheck className="text-xs animate-pop-in" style={{ color: activeColor }} />
                                    ) : (
                                        <MdContentCopy className="text-xs animate-pop-in group-hover:text-[var(--terminal-text)] transition-colors" style={{ color: activeColor }} />
                                    )}
                                    <span className={`text-xs font-bold uppercase transition-colors ${copied ? 'text-[var(--terminal-text)]' : 'text-[var(--terminal-text)]/80 group-hover:text-[var(--terminal-text)]'}`}>
                                        {copied ? 'Link_Copied' : 'Copy_Link'}
                                    </span>
                                </div>
                            </div>
                        </button>

                        <div className="p-3 border border-[rgba(var(--terminal-text-rgb),0.5)] bg-[rgba(var(--terminal-text-rgb),0.05)] rounded flex flex-col justify-center">
                            <span className="text-xs text-[var(--terminal-text-muted)] block uppercase mb-1">Object_ID</span>
                            <span className="text-xs text-[var(--terminal-text)] font-bold tracking-widest uppercase">
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
        </Reveal>
    );
}