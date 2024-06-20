import React, { useEffect, useState } from 'react';
import mapboxgl, { GeoJSONSourceRaw } from 'mapbox-gl';
import '@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css';
import axios from 'axios';
import { Step, Waypoint, Wind } from '../types/common';
import { getOptimizedRoute } from '../utils/constants/endpoints';

const MapboxMap: React.FC = () => {
    const [map, setMap] = useState<mapboxgl.Map | null>(null);
    const [optimizedRoute, setOptimizedRoute] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    const handleClearRouteState = () => {
        setOptimizedRoute(null);
        map?.remove();
        setMap(null);
        initializeMap();
    };

    const handleFetchingOptimizedRoute = async () => {
        try {
            if (loading) {
                return;
            }
            setLoading(true);
            const response = await axios.get(getOptimizedRoute);
            const data = response.data;
            setOptimizedRoute(data);
        } catch (error) {
            console.error('Error fetching optimized route:', error);
        } finally {
            setLoading(false);
        }
    };
    const determineLineColor = (angleDifference: number) => {
        if ((angleDifference >= 135 && angleDifference <= 225) || (angleDifference >= -225 && angleDifference <= -135)) {
            // Headwind
            return '#DC143C';
        } else if ((angleDifference >= 0 && angleDifference <= 60) || (angleDifference >= -60 && angleDifference <= 0)) {
            // Tailwind
            return '#50C878';
        } else {
            // Default color for side wind
            return 'blue';
        }
    };

    const initializeMap = async () => {
        mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN!;
        const newMap = new mapboxgl.Map({
            container: 'map-container',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [4.3145285, 52.0381466],
            zoom: 10,
            pitchWithRotate: false,
            maxBounds: [
                [3.314971144228537, 50.80372101501058],
                [7.092053256873136, 53.511754588831934],
            ],
            dragRotate: false,
            touchZoomRotate: false,
        });
        setMap(newMap);
    };

    useEffect(() => {
        if (!map) {
            initializeMap();

            return;
        }
        if (!optimizedRoute) {
            return;
        }

        const firstStopLocation = optimizedRoute.waypoints.filter((waypoint: Waypoint) => waypoint.waypoint_index === 0).location;
        map?.setCenter(firstStopLocation);
        map?.setZoom(12);

        let routeFeatures: any = [];
        optimizedRoute?.trips[0]?.legs.forEach((leg: { steps: Step[]; wind: Wind }, legIndex: number) => {
            leg.steps.forEach(step => {
                const stepCoordinates = step.geometry.coordinates;
                const stepDirectionDegree = step.maneuver.bearing_after;
                const angleDifference = leg.wind.deg - stepDirectionDegree;

                const lineColor = determineLineColor(angleDifference);

                const feature = {
                    type: 'Feature',
                    properties: {
                        lineColor: lineColor,
                    },
                    geometry: {
                        type: 'LineString',
                        coordinates: stepCoordinates,
                    },
                };

                routeFeatures.push(feature);
            });

            map.loadImage('assets/arrow.png', (error, image) => {
                if (error) throw error;

                if (legIndex < optimizedRoute.waypoints.length - 1) {
                    const stepsLength = optimizedRoute.trips[0].legs[legIndex].steps.length;
                    const middleStepIndex = Math.floor(stepsLength / 2);

                    const geojson: GeoJSONSourceRaw = {
                        type: 'geojson',
                        data: {
                            type: 'Feature',
                            properties: {},
                            geometry: {
                                type: 'Point',
                                coordinates: optimizedRoute.trips[0].legs[legIndex].steps[middleStepIndex].geometry.coordinates[0],
                            },
                        },
                    };
                    map.addSource(`arrows-${legIndex}`, geojson);
                    map.addImage(`wind-arrow-${legIndex}`, image!);
                    map.addLayer({
                        id: `wind-arrow-${legIndex}`,
                        type: 'symbol',
                        source: `arrows-${legIndex}`,
                        layout: {
                            'icon-image': `wind-arrow-${legIndex}`,
                            'icon-size': 1,
                            'icon-allow-overlap': false,
                            'icon-ignore-placement': true,
                            'icon-rotate': leg.wind.deg,
                        },
                        paint: {},
                    });
                }
            });
        });

        const geojson: GeoJSONSourceRaw = {
            type: 'geojson',
            data: {
                type: 'FeatureCollection',
                features: routeFeatures,
            },
        };

        map.addSource(`route`, geojson);

        map.addLayer({
            id: `route`,
            type: 'line',
            source: `route`,
            layout: {
                'line-join': 'round',
                'line-cap': 'round',
            },
            paint: {
                'line-width': 4,
                'line-color': ['get', 'lineColor'],
            },
        });
        map.addLayer(
            {
                id: `routearrows`,
                type: 'symbol',
                source: `route`,
                layout: {
                    'symbol-placement': 'line',
                    'text-field': '▶',
                    'text-size': 40,
                    'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 30, 70, 160, 250],
                    'text-keep-upright': false,
                },
                paint: {
                    'text-color': 'black',
                    'text-halo-color': 'hsl(55, 11%, 96%)',
                    'text-halo-width': 3,
                },
            },
            `route`
        );
        optimizedRoute?.waypoints?.forEach((waypoint: Waypoint) => {
            const markerColor = waypoint.waypoint_index === 0 ? 'red' : waypoint.waypoint_index === optimizedRoute.waypoints.length - 1 ? 'black' : '#92BEFF';
            const marker = new mapboxgl.Marker({ color: markerColor });
            marker.setLngLat(waypoint.location).addTo(map);
        });
    }, [map, optimizedRoute]);

    return (
        <div className="app-container">
            <div className="btn-container">
                <button className="btn" onClick={handleFetchingOptimizedRoute} disabled={loading || optimizedRoute}>
                    {loading ? 'Loading the Route...' : 'Random Route'}
                </button>
                <button className="btn red" disabled={!optimizedRoute} onClick={handleClearRouteState}>
                    Clear Route
                </button>
                {optimizedRoute && 
                <div className="info-container">
                    <p className="info-card red-text">Starting point: Red Marker</p>
                    <p className="info-card">Ending point: Black Marker</p>
                </div>
                }
            </div>
            <div id="map-container" />;
        </div>
    );
};

export default MapboxMap;
