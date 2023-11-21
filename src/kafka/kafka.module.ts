import { Module } from '@nestjs/common';
import { KafkaConsumer } from './kafka.consumer';
import { KafkaProducer } from './kafka.producer';

@Module({
  imports: [],
  providers: [
    KafkaConsumer,
    KafkaProducer,
  ],
  exports: [KafkaProducer],
})
export class KafkaModule {
  constructor(
    private kafkaConsumer: KafkaConsumer,
    private kafkaProducer: KafkaProducer,
  ) {
    console.log('kafka listen');
    this.kafkaProducer.loadClient();
    this.kafkaConsumer.listen();
  }

}
