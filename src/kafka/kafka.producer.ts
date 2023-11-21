import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, Producer, logLevel } from 'kafkajs';

@Injectable()
export class KafkaProducer {
  private kafka: Kafka;
  private producer: Producer;
  static self: KafkaProducer;
  constructor(
    private configService: ConfigService,
  ) {
    KafkaProducer.self = this;
  }

  async loadClient() {
    const { KAFKA_USERNAME: username, KAFKA_PASSWORD: password } = process.env
    const sasl = username && password ? { username, password, mechanism: 'plain' } : null
    const ssl = !!sasl
    const kafkaConfig: any = {
      logLevel: logLevel.INFO,
      brokers: this.configService
        .get<string>('KAFKA_BROKERS', 'localhost:9093')
        .split(','),
      clientId: this.configService.get<string>(
        'KAFKA_CLIENT',
        'ubet-m-user-process',
      ),
      ssl,
      sasl,
    }
    this.kafka = new Kafka({...kafkaConfig, connectionTimeout: 10000});
    this.producer = this.kafka.producer();
    await this.producer.connect();
    console.log('load client complete')
  }


  static async pushKafka({
    topic,
    value,
    key,
    source,
    timestamp,
  }: {
    topic: string;
    value: string;
    key?: string;
    source?: string;
    timestamp?: number;
  }) {
    console.log('value', value);
    const data = {
      content: value,
      sendAt: Date.now(),
    };

    if (!this.self.producer) {
      throw new InternalServerErrorException('Not Connect to Kafka');
    }
    const message: any = { key, value: JSON.stringify(data) };
    if (timestamp) {
      message.timestamp = timestamp;
    }
    const rs = await this.self.producer.send({
      topic,
      messages: [message],
    });
    console.log('PushKafka success', topic);
    return rs;
  }
}
