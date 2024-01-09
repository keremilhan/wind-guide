import { Injectable } from '@nestjs/common';
import { RoutingData } from 'src/interfaces/routing-data.interface';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RoutingDataService {
  private readonly mockDataPath = path.resolve(
    __dirname.replace('/dist', '/src'),
    '../data/mock-routing-data.json',
  );

  getMockRoutingData(): RoutingData[] {
    try {
      const rawData = fs.readFileSync(this.mockDataPath, 'utf-8');
      return JSON.parse(rawData);
    } catch (error) {
      console.error('Error while reading mock routing data file:', error);
    }
  }
}
