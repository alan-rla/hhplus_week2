import { Test, TestingModule } from '@nestjs/testing';
import { LectureController } from './lecture.controller';
import { DatabaseModule } from 'src/database/database.module';
import { LectureService } from './lecture.service';
import { LectureTable } from 'src/database/lecture.table';
import { LectureUserTable } from 'src/database/lecture.user.table';
import { LectureUser } from 'src/entities/LectureUser.entity';
import { plainToInstance } from 'class-transformer';
import { LectureIdUserIdDto } from './dto/lectureId.userId.dto';
import {
  StorageDriver,
  addTransactionalDataSource,
  getDataSourceByName,
  initializeTransactionalContext,
} from 'typeorm-transactional';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from 'src/database/database.service';
import { DataSource } from 'typeorm';
import { dataSourceOptions } from 'src/database/database.config';
import { HttpException } from '@nestjs/common';

const lectureUser = { id: 1, lectureId: 1, userId: 1, createdAt: Date.now() };
const lectureUserEntity = plainToInstance(LectureUser, lectureUser);
const lectureIdUserIdDto = plainToInstance(LectureIdUserIdDto, { userId: 1, lectureId: 1 });

describe('LectureController', () => {
  let module: TestingModule;
  let lectureController: LectureController;
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

    lectureController = module.get<LectureController>(LectureController);
    lectureService = module.get<LectureService>(LectureService);
    lectureTable = module.get<LectureTable>(LectureTable);
    lectureUserTable = module.get<LectureUserTable>(LectureUserTable);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(lectureController).toBeDefined();
  });

  describe('POST /lectures/apply', () => {
    // 특강 신청 성공 케이스
    it('should succeed and be returned with inserted result', async () => {
      jest.useFakeTimers();
      jest.spyOn(lectureService, 'isApplicationOpen').mockResolvedValue(true);
      jest.spyOn(lectureService, 'lectureExists').mockResolvedValue(true);
      jest.spyOn(lectureService, 'isBelowMaxEntry').mockResolvedValue(true);
      jest.spyOn(lectureUserTable, 'insert').mockResolvedValue(lectureUser);
      jest.spyOn(lectureService, 'apply').mockResolvedValue(lectureUserEntity);
      await expect(lectureController.apply(lectureIdUserIdDto)).resolves.toEqual(lectureUserEntity);
    });

    // 특강 신청 실패 케이스 (강의 없음)
    it('should fail because lecture does not exist', async () => {
      jest.spyOn(lectureService, 'isApplicationOpen').mockResolvedValue(true);
      jest.spyOn(lectureService, 'lectureExists').mockImplementation(() => {
        throw new HttpException('LECTURE_NOT_FOUND', 500);
      });
      await expect(lectureController.apply(lectureIdUserIdDto)).rejects.toThrow('LECTURE_NOT_FOUND');
    });

    // 특강 신청 실패 케이스 (정원 초과)
    it('should fail because the max entry has been reached', async () => {
      jest.spyOn(lectureService, 'isApplicationOpen').mockResolvedValue(true);
      jest.spyOn(lectureService, 'lectureExists').mockResolvedValue(true);
      jest.spyOn(lectureService, 'isBelowMaxEntry').mockImplementation(() => {
        throw new HttpException('MAX_ENTRY_REACHED', 500);
      });
      await expect(lectureController.apply(lectureIdUserIdDto)).rejects.toThrow('MAX_ENTRY_REACHED');
    });

    // 특강 신청 오픈 전 요청
    it('should fail because lecture application is not open yet', async () => {
      jest.spyOn(lectureService, 'isApplicationOpen').mockImplementation(() => {
        throw new HttpException('LECTURE_NOT_OPEN', 500);
      });
      await expect(lectureController.apply(lectureIdUserIdDto)).rejects.toThrow('LECTURE_NOT_OPEN');
    });
  });

  describe('GET /lectures/application/{userId}', () => {
    // 특강 신청 정원 내 들어감
    it('should be included in lecture entry and returned true', async () => {
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue([lectureUserEntity]);
      jest.spyOn(lectureService, 'getUserEntry').mockResolvedValue(true);
      await expect(lectureController.getUserEntry(lectureIdUserIdDto)).resolves.toEqual(true);
    });

    // 특강 신청 정원 내 못들어감
    it('should not be included in lecture entry and returned false', async () => {
      const lectureUserEntity = plainToInstance(LectureUser, lectureUser);
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue([lectureUserEntity]);
      jest.spyOn(lectureService, 'getUserEntry').mockResolvedValue(false);
      await expect(lectureController.getUserEntry(lectureIdUserIdDto)).resolves.toEqual(false);
    });
  });
});
