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
    return await KafkaProducer.pushKafka({ topic: this.configService.get('topic', 'link-listen-confluent'), ...request })
  }

  @Post('random')
  async randomPush(@Body() request: any): Promise<any> {
    console.log('request:', request);
    for (let index = 0; index < (request.number || 0); index++) {
      await KafkaProducer.pushKafka({ topic: this.configService.get('topic', 'link-listen-confluent'), ...request, value: { id: index, ...request.value } })
    }
    return { number: request.number };
  }
}
