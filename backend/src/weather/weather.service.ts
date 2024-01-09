import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { AxiosResponse } from 'axios';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WeatherService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async getWeather(lat: number, lon: number): Promise<AxiosResponse<any>> {
    const apiKey = this.configService.get<string>('OPEN_WEATHER_MAP_API_KEY');
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    try {
      const response = await firstValueFrom(this.httpService.get(url));
      return response;
    } catch (error) {
      console.error('Error:', error);
      throw error;
    }
  }
}
