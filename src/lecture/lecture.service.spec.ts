import { Test, TestingModule } from '@nestjs/testing';
import { LectureService } from './lecture.service';
import { LectureTable } from 'src/database/lecture.table';
import { LectureUserTable } from 'src/database/lecture.user.table';
import { DatabaseModule } from 'src/database/database.module';
import { LectureController } from './lecture.controller';
import { plainToInstance } from 'class-transformer';
import { LectureUser } from 'src/entities/LectureUser.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from 'src/database/database.config';
import {
  StorageDriver,
  addTransactionalDataSource,
  getDataSourceByName,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { DatabaseService } from 'src/database/database.service';
import { Lecture } from 'src/entities/Lecture.entity';

const lectureUser = { id: 1, lectureId: 1, userId: 1, createdAt: Date.now() };
const lectureUserEntity = plainToInstance(LectureUser, lectureUser);
const lectureUserArray = [];
for (let i = 0; i < 30; i++) lectureUserArray.push(lectureUserEntity);
const lecture = { id: 1, name: '특강이름' };
const lectureEntity = plainToInstance(Lecture, lecture);
const userId1 = 1;
const userId2 = 2;
const lectureId1 = 1;

describe('LectureService', () => {
  let module: TestingModule;
  let lectureService: LectureService;
  let lectureTable: LectureTable;
  let lectureUserTable: LectureUserTable;

  beforeEach(async () => {
    initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
    module = await Test.createTestingModule({
      imports: [
        DatabaseModule,
        TypeOrmModule.forRootAsync({
          imports: [DatabaseModule],
          useClass: DatabaseService,
          inject: [DatabaseService],
          dataSourceFactory: async () => {
            return getDataSourceByName('default') || addTransactionalDataSource(new DataSource(dataSourceOptions));
          },
        }),
      ],
      controllers: [LectureController],
      providers: [LectureService],
    }).compile();

    lectureService = module.get<LectureService>(LectureService);
    lectureTable = module.get<LectureTable>(LectureTable);
    lectureUserTable = module.get<LectureUserTable>(LectureUserTable);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(lectureService).toBeDefined();
  });

  describe('LectureService', () => {
    // 강의 있음
    it('lecture exists', async () => {
      jest.spyOn(lectureTable, 'selectById').mockResolvedValue(lectureEntity);
      await expect(lectureService.lectureExists(lectureId1)).resolves.toEqual(true);
    });

    // 강의 있음
    it('lecture does not exist', async () => {
      jest.spyOn(lectureTable, 'selectById').mockResolvedValue(null);
      await expect(lectureService.lectureExists(lectureId1)).rejects.toThrow('LECTURE_NOT_FOUND');
    });

    // 특강 오픈 2024년 6월 29일 오전 9시
    // 특강 신청 시간 전 fail
    it('application is not open', async () => {
      const june25 = new Date(2024, 5, 25, 0, 0, 0).getTime();
      await expect(lectureService.isApplicationOpen(june25)).rejects.toThrow('LECTURE_NOT_OPEN');
    });

    // 특강 신청 시간 후 success
    it('application is open', async () => {
      const june30 = new Date(2024, 5, 30, 0, 0, 0).getTime();
      await expect(lectureService.isApplicationOpen(june30)).resolves.toEqual(true);
    });

    // maxEntry 아직 안참
    it('should return true because the max entry has not been reached', async () => {
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue([lectureUserEntity]);
      await expect(lectureService.isBelowMaxEntry(userId1)).resolves.toEqual(true);
    });

    // maxEntry 다 참
    it('should return true because the max entry has not been reached', async () => {
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue(lectureUserArray);
      await expect(lectureService.isBelowMaxEntry(userId1)).rejects.toThrow('MAX_ENTRY_REACHED');
    });

    // 특강 신청 정원 내 들어감
    it('should be included in lecture entry and returned true', async () => {
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue([lectureUserEntity]);
      await expect(lectureService.getUserEntry(userId1, lectureId1)).resolves.toEqual(true);
    });

    // 특강 신청 정원 내 못들어감
    it('should fail because lecture application is not open yet', async () => {
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue(lectureUserArray);
      await expect(lectureService.getUserEntry(userId2, lectureId1)).resolves.toEqual(false);
    });

    // 특강 신청
    it('should succeed and be returned with created model', async () => {
      jest.spyOn(lectureUserTable, 'insert').mockResolvedValue(lectureUser);
      await expect(lectureService.apply(userId1, lectureId1)).resolves.toEqual(lectureUserEntity);
    });
  });
});
