import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import {
  StorageDriver,
  addTransactionalDataSource,
  getDataSourceByName,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from 'src/database/database.config';
import { RedisModule } from '@nestjs-modules/ioredis';
import { LecturesModule } from 'src/lecture/lectures.module';
import { Lecture } from 'src/entities/Lecture.entity';
import { plainToInstance } from 'class-transformer';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRootAsync({
          imports: [DatabaseModule],
          useClass: DatabaseService,
          inject: [DatabaseService],
          dataSourceFactory: async () => {
            return getDataSourceByName('default') || addTransactionalDataSource(new DataSource(dataSourceOptions));
          },
        }),
        RedisModule.forRootAsync({
          useFactory: () => ({
            type: 'single',
            url: 'redis://localhost:6379',
          }),
        }),
        DatabaseModule,
        LecturesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /lectures/apply', async () => {
    const userId = 1;
    const lectureId = 1;
    await request(app.getHttpServer()).post('/lectures/apply').send({ userId, lectureId }).expect(200);
  });

  it('GET /lectures', async () => {
    const lecture = plainToInstance(Lecture, { id: 1, name: '특강이름' });
    await request(app.getHttpServer()).post('/lectures').send({ name: '특강이름' }).expect(200).expect(lecture);
    await request(app.getHttpServer()).get('/lectures').expect(200).expect(lecture);
  });

  it('GET /lectures/application/{:userId}', async () => {
    const userId = 1;
    await request(app.getHttpServer()).post(`/lectures/application/${userId}`).expect(200).expect({ success: true });
  });
});
