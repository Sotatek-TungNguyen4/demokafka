import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { KafkaProducer } from './kafka/kafka.producer';
import { ConfigService } from '@nestjs/config';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private configService: ConfigService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  async pushToKafka(@Body() request: any,): Promise<any> {
    return await KafkaProducer.pushKafka({ topic: 'listen-confluent', ...request })
  }
}