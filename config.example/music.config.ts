export type Platform = 'Spotify' | 'SoundCloud' | 'YouTube';

export interface Track {
    id: string;
    title: string;
    platform: Platform;
    url: string;
    category: string;
}

export const discography: Track[] = [
    {
        id: '',
        title: '',
        platform: 'Spotify',
        url: '',
        category: '',
    }

];
