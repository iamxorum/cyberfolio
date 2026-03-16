export interface DataCenterNode {
    id: string;
    name: string;
    lat: number;
    lng: number;
}

export interface DCConfig {
    nodes: DataCenterNode[];
    mapCenter: {
        lat: number;
        lng: number;
        altitude: number;
    };
}

export const dcConfig: DCConfig = {
    nodes: [
        {
            id: 'Example',
            name: 'Location, Country',
            lat: 0,
            lng: 0,
        },
    ],
    mapCenter: {
        lat: 0,
        lng: 0,
        altitude: 2.2,
    },
};