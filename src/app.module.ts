import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { LecturesModule } from './lectures/lectures.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './database/database.config';
import { DatabaseService } from './database/database.service';
import { DataSource } from 'typeorm';
import { addTransactionalDataSource } from 'typeorm-transactional';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [DatabaseModule],
      useClass: DatabaseService,
      inject: [DatabaseService],
      async dataSourceFactory(options) {
        if (!options) throw new Error('Invalid options passed');
        return addTransactionalDataSource(new DataSource(dataSourceOptions));
      },
    }),
    DatabaseModule,
    LecturesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
