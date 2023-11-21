import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KafkaModule } from './kafka/kafka.module';
import { ShareModule } from './share.module';

@Module({
  imports: [ShareModule, KafkaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
