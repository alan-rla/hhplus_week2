import { Test, TestingModule } from '@nestjs/testing';
import { LectureController } from './lecture.controller';
import { DatabaseModule } from 'src/database/database.module';
import { LectureService } from './lecture.service';
import { LectureTable } from 'src/database/lecture.table';
import { LectureUserTable } from 'src/database/lecture.user.table';
import { LectureUser } from 'src/entities/LectureUser.entity';
import { plainToInstance } from 'class-transformer';

const lectureUser = { id: 1, lectureId: 1, userId: 1, createdAt: Date.now() };
const lectureUserEntity = plainToInstance(LectureUser, lectureUser);

describe('LectureController', () => {
  let module: TestingModule;
  let lectureController: LectureController;
  let lectureService: LectureService;
  let lectureTable: LectureTable;
  let lectureUserTable: LectureUserTable;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DatabaseModule],
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
      jest.spyOn(lectureService, 'isBelowMaxEntry').mockResolvedValue(true);
      jest.spyOn(lectureUserTable, 'insert').mockResolvedValue(lectureUser);
      jest.spyOn(lectureService, 'apply').mockResolvedValue(lectureUser);
      await expect(lectureController.apply({ userId: 1, lectureId: 1 })).resolves.toEqual({ success: true });
    });

    // 특강 신청 실패 케이스
    it('should fail because the max entry has been reached', async () => {
      jest.spyOn(lectureService, 'isApplicationOpen').mockResolvedValue(true);
      jest.spyOn(lectureService, 'isBelowMaxEntry').mockResolvedValue(false);
      await expect(lectureController.apply({ userId: 1, lectureId: 1 })).rejects.toThrow('MAX_ENTRY_REACHED');
    });

    // 특강 신청 오픈 전 요청
    it('should fail because lecture application is not open yet', async () => {
      jest.spyOn(lectureService, 'isApplicationOpen').mockResolvedValue(false);
      await expect(lectureController.apply({ userId: 1, lectureId: 1 })).rejects.toThrow('LECTURE_NOT_OPEN');
    });
  });

  describe('GET /lectures/application/{userId}', async () => {
    // 특강 신청 정원 내 들어감
    it('should be included in lecture entry and returned true', async () => {
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue([lectureUserEntity]);
      jest.spyOn(lectureService, 'getUserEntry').mockResolvedValue(true);
      await expect(lectureController.getUserEntry({ userId: 1 })).resolves.toEqual(true);
    });

    // 특강 신청 정원 내 못들어감
    it('should not be included in lecture entry and returned false', async () => {
      const lectureUserEntity = plainToInstance(LectureUser, lectureUser);
      jest.spyOn(lectureUserTable, 'selectAllUsersByLectureId').mockResolvedValue([lectureUserEntity]);
      jest.spyOn(lectureService, 'getUserEntry').mockResolvedValue(false);
      await expect(lectureController.getUserEntry({ userId: 1 })).resolves.toEqual(true);
    });
  });
});
