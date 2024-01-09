import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoutingDataController } from './routing-data/routing-data.controller';
import { RoutingDataService } from './routing-data/routing-data.service';
import { ConfigModule } from '@nestjs/config';
import { WeatherService } from './weather/weather.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [ConfigModule.forRoot(), HttpModule],
  controllers: [AppController, RoutingDataController],
  providers: [AppService, RoutingDataService, WeatherService],
})
export class AppModule {}
