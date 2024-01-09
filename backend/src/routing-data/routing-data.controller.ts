import { Controller, Get } from '@nestjs/common';
import { RoutingDataService } from './routing-data.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { RoutingData } from 'src/interfaces/routing-data.interface';
import { WeatherService } from 'src/weather/weather.service';

@Controller('routing-data')
export class RoutingDataController {
  constructor(
    private readonly routingDataService: RoutingDataService,
    private readonly weatherService: WeatherService,
    private readonly configService: ConfigService,
  ) {}
  private getRandomPoints(array: RoutingData[], count: number): RoutingData[] {
    const shuffled = array.slice();

    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
  }
  @Get()
  async getOptimizedRouteWithWindInfo(): Promise<any> {
    try {
      const accessToken = this.configService.get<string>('MAPBOX_ACCESS_TOKEN');
      const routingData = this.routingDataService.getMockRoutingData();
      const selectedRoutingData = this.getRandomPoints(routingData, 12);
      const routingLatLngs = selectedRoutingData.map((obj: RoutingData) => {
        return `${obj.lng},${obj.lat}`;
      });

      const response = await axios.get(
        `https://api.mapbox.com/optimized-trips/v1/mapbox/cycling/${routingLatLngs.join(
          ';',
        )}?source=first&destination=last&roundtrip=false&steps=true&geometries=geojson&access_token=${accessToken}`,
      );

      const legsWithWeather = await Promise.all(
        response.data.trips[0].legs.map(async (leg: any) => {
          const stepsLength = leg.steps.length;
          const middleStepIndex = Math.floor(stepsLength / 2);
          const middleStepCoordinates =
            leg.steps[middleStepIndex].geometry.coordinates[0];
          const weatherResponse = await this.weatherService.getWeather(
            middleStepCoordinates[1],
            middleStepCoordinates[0],
          );
          return {
            ...leg,
            wind: weatherResponse.data.wind,
          };
        }),
      );

      return {
        ...response.data,
        trips: [{ ...response.data.trips[0], legs: legsWithWeather }],
      };
    } catch (error) {
      console.log(error, 'error');
      throw error;
    }
  }
}
