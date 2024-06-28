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
import { HttpException } from '@nestjs/common';

const lectureUser = { id: 1, lectureId: 1, userId: 1, createdAt: Date.now() };
const lectureUserEntity = plainToInstance(LectureUser, lectureUser);
const lectureUserArray = [];
for (let i = 0; i < 30; i++) lectureUserArray.push(lectureUserEntity);
const lecture = {
  id: 1,
  name: 'test',
  entry: 30,
  openDate: new Date('2024-06-30T04:00:00.000Z'),
  createdAt: Date.now(),
};
const lectureEntity = plainToInstance(Lecture, lecture);
const userId1 = 1;
const lectureId1 = 1;
const entry = 30;

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
      await expect(lectureService.lectureExists(lectureId1)).resolves.toEqual(lectureEntity);
    });

    // 강의 있음
    it('lecture does not exist', async () => {
      jest.spyOn(lectureTable, 'selectById').mockResolvedValue(null);
      await expect(lectureService.lectureExists(lectureId1)).rejects.toThrow('LECTURE_NOT_FOUND');
    });

    // 특강 오픈 2024년 6월 29일 오전 9시
    // 테스트 날짜 6월 29일 이전이므로 fail
    // 특강 신청 시간 전 fail
    it('application is not open', async () => {
      const june30 = new Date(2024, 5, 30, 0, 0, 0);
      expect(() => lectureService.isApplicationOpen(june30)).toThrow(new HttpException('LECTURE_NOT_OPEN', 500));
    });

    // 특강 openDate 후 success
    it('application is open', async () => {
      const june20 = new Date(2024, 5, 20, 0, 0, 0);
      expect(lectureService.isApplicationOpen(june20)).toEqual(true);
    });

    // entry 아직 안참
    // entry는 lectureExists에서 가져온 entry의 숫자로 판단
    it('should return true because the max entry has not been reached', async () => {
      expect(lectureService.isBelowEntry(1)).toEqual(true);
    });

    // entry 다 참
    it('should throw error because the max entry has been reached', async () => {
      expect(() => lectureService.isBelowEntry(0)).toThrow(new HttpException('ENTRY_REACHED', 500));
    });

    // 특강 이미 신청함
    it('user already applied to the lecture', async () => {
      jest.spyOn(lectureUserTable, 'selectByLectureIdUserId').mockResolvedValue(lectureUserEntity);
      await expect(lectureService.hasUserAlreadyApplied(lectureId1, userId1)).rejects.toThrow('ALREADY_APPLIED');
    });

    // 특강 신청 정원 내 들어감
    it('should be included in lecture entry and returned true', async () => {
      jest.spyOn(lectureUserTable, 'selectByLectureIdUserId').mockResolvedValue(lectureUserEntity);
      await expect(lectureService.getUserEntry(lectureId1, userId1)).resolves.toEqual(true);
    });

    // 특강 신청 정원 내 못들어감
    it('should fail because lecture application is not open yet', async () => {
      jest.spyOn(lectureUserTable, 'selectByLectureIdUserId').mockResolvedValue(null);
      await expect(lectureService.getUserEntry(lectureId1, userId1)).resolves.toEqual(false);
    });

    // 특강 신청 성공
    it('should succeed and be returned with created model', async () => {
      jest.spyOn(lectureTable, 'update').mockResolvedValue(lecture);
      jest.spyOn(lectureUserTable, 'insert').mockResolvedValue(lectureUser);
      await expect(lectureService.apply(userId1, lectureId1, entry)).resolves.toEqual(lectureUserEntity);
    });
  });
});
