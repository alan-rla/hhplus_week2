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
import { LectureModule } from 'src/lecture/lecture.module';
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
        LectureModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /lectures/apply', async () => {
    await Promise.all([
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 1, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 2, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 3, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 4, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 5, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 6, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 7, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 8, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 9, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 10, lectureId: 1 }).expect(201),
      // 10
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 11, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 12, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 13, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 14, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 15, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 16, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 17, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 18, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 19, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 20, lectureId: 1 }).expect(201),
      //20
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 21, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 22, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 23, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 24, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 25, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 26, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 27, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 28, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 29, lectureId: 1 }).expect(201),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 30, lectureId: 1 }).expect(201),
      // 30
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 31, lectureId: 1 }).expect(501),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 32, lectureId: 1 }).expect(501),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 33, lectureId: 1 }).expect(501),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 34, lectureId: 1 }).expect(501),
      request(app.getHttpServer()).post('/lectures/apply').send({ userId: 35, lectureId: 1 }).expect(501),
    ]);
  });

  it('GET /lectures', async () => {
    const lecture = plainToInstance(Lecture, {
      id: 1,
      name: 'test',
      entry: 30,
      openDate: new Date('2024-06-30T04:00:00.000Z'),
      createdAt: Date.now(),
    });
    await request(app.getHttpServer())
      .post('/lectures')
      .send({ name: '특강이름', entry: 30, openDate: new Date('2024-06-30T04:00:00.000Z') })
      .expect(200)
      .expect(lecture);
    await request(app.getHttpServer()).get('/lectures').expect(201).expect(lecture);
  });

  it('GET /lectures/application/{:userId}', async () => {
    const userId = 1;
    const lectureId = 1;
    await request(app.getHttpServer())
      .get(`/lectures/${lectureId}/application/${userId}`)
      .expect(200)
      .expect({ success: true });
  });
});
