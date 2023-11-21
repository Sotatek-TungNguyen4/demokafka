import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Kafka, KafkaMessage, logLevel } from 'kafkajs';

@Injectable()
export class KafkaConsumer {
  private kafka: Kafka;
  constructor(
    private configService: ConfigService,
  ) {
  }

  // async listen(handlers: BaseHandler[]) {
  //   const key = `NUMBER_CRAWLER`;
  //   const processCount = this.configService.get<number>(key, 0);
  //   if (!processCount) {
  //     return;
  //   }

  //   for (const handler of handlers) {
  //     const topics = this.configService.get<string>(`topic_crawler_${handler.name}`, '');
  //     if (!topics)
  //       continue;
  //     for (const topic of topics.split(',')) {
  //       this.handlers.set(topic, handler);
  //     }

  //   }

  //   await this.loadClient();
  //   for (let index = 0; index < processCount; index++) {
  //     this.start(index, [...this.handlers.keys()]);
  //   }
  // }

  async listen() {
    await this.loadClient();

    const consumer = this.kafka.consumer({
      groupId: this.configService.get('group_id', 'demo-confluent'),
    });
    await consumer.connect();
    console.log('consumer connected')

    await consumer.subscribe({
      topic: "listen-confluent",
      fromBeginning: true,
    });
    await consumer.run({
      autoCommit: true,
      eachMessage: async (kafkaData: {
        topic: string;
        partition: number;
        message: KafkaMessage;
      }) => {
        const { message } = kafkaData;
        console.log('message at consumer: ', message.value.toString(), message.timestamp, message.offset);
        const messageData = JSON.parse(message.value.toString() || '{}');
        const { content, sendAt } = messageData;
        console.log('spent ', content?.id, sendAt, (Date.now() - +sendAt));
      },
    });
    console.log('listen kafa');
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
    this.kafka = new Kafka({ ...kafkaConfig, connectionTimeout: 10000 });
  }

}
