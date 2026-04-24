export type Platform = 'Spotify' | 'SoundCloud' | 'YouTube';

export interface Track {
    id: string;
    title: string;
    album: string;
    platform: Platform;
    url: string;
    category: string;
}

export const discography: Track[] = [
    {
        id: '',
        title: '',
        album: '',
        platform: 'Spotify',
        url: '',
        category: '',
    }

];

export const getTracksByCategory = (category: string) =>
    discography.filter(t => t.category === category);