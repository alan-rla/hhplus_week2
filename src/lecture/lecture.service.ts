import { HttpException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LectureTable } from 'src/database/lecture.table';
import { LectureUserTable } from 'src/database/lecture.user.table';
import { LectureUser, LectureUserModel } from 'src/entities/LectureUser.entity';
import { Transactional } from 'typeorm-transactional';
import { Lecture, LectureModel } from 'src/entities/Lecture.entity';

@Injectable()
export class LectureService {
  constructor(
    private lectureTable: LectureTable,
    private lectureUserTable: LectureUserTable,
  ) {}
  private readonly lectureApplyPromiseMap = new Map<number, Promise<[LectureModel, LectureUserModel]>>();

  @Transactional()
  async createLecture(name: string, entry: number, openDate: Date) {
    const entity = plainToInstance(
      Lecture,
      { name, entry, openDate },
      { excludeExtraneousValues: true, exposeUnsetFields: false },
    );

    const lecture = await this.lectureTable.insert(entity);
    return plainToInstance(Lecture, lecture);
  }

  @Transactional()
  async lectureExists(lectureId: number): Promise<Lecture> {
    const lecture = await this.lectureTable.selectById(lectureId);
    if (!lecture) throw new HttpException('LECTURE_NOT_FOUND', 501);
    else return lecture;
  }

  isApplicationOpen(openDate: Date): true {
    const now = Date.now();
    const openDateValue = new Date(openDate).getTime();
    if (openDateValue > now) throw new HttpException('LECTURE_NOT_OPEN', 501);
    else return true;
  }

  isBelowEntry(entry: number): true {
    if (entry <= 0) throw new HttpException('ENTRY_REACHED', 501);
    else return true;
  }

  async hasUserAlreadyApplied(lectureId: number, userId: number): Promise<boolean> {
    const lectureUser = await this.lectureUserTable.selectByLectureIdUserId(lectureId, userId);
    if (lectureUser) throw new HttpException('ALREADY_APPLIED', 501);
    else return true;
  }

  async getUserEntry(lectureId: number, userId: number): Promise<boolean> {
    const lectureUser = await this.lectureUserTable.selectByLectureIdUserId(lectureId, userId);
    return lectureUser ? true : false;
  }

  @Transactional()
  async apply(userId: number, lectureId: number, entry: number) {
    const body = { userId, lectureId };
    entry -= 1;
    const entity = plainToInstance(LectureUser, body, { excludeExtraneousValues: true, exposeUnsetFields: false });
    const lecture = plainToInstance(Lecture, { entry });

    const lastPromise = this.lectureApplyPromiseMap.get(userId) || Promise.resolve();
    const newPromise = lastPromise.then(async () => {
      return await Promise.all([
        this.lectureTable.update(lectureId, lecture), //
        this.lectureUserTable.insert(entity),
      ]);
    });
    this.lectureApplyPromiseMap.set(userId, newPromise);
    return newPromise;
  }
}
