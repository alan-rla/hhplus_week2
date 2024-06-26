import { HttpException, Injectable } from '@nestjs/common';
import { plainToInstance } from 'class-transformer';
import { LectureTable } from 'src/database/lecture.table';
import { LectureUserTable } from 'src/database/lecture.user.table';
import { LectureUser } from 'src/entities/LectureUser.entity';
import { Transactional } from 'typeorm-transactional';
import { Lecture } from 'src/entities/Lecture.entity';

@Injectable()
export class LectureService {
  constructor(
    private lectureTable: LectureTable,
    private lectureUserTable: LectureUserTable,
  ) {}

  @Transactional()
  async postLecture(name: string) {
    const entity = plainToInstance(Lecture, { name }, { excludeExtraneousValues: true, exposeUnsetFields: false });
    const lecture = await this.lectureTable.insert(entity);
    return plainToInstance(Lecture, lecture);
  }

  async lectureExists(lectureId: number): Promise<boolean> {
    const lecture = await this.lectureTable.selectById(lectureId);
    if (!lecture) throw new HttpException('LECTURE_NOT_FOUND', 500);
    else return true;
  }
  async isApplicationOpen(date: number): Promise<boolean> {
    // 오픈 날짜 2024-06-29 오전 9시
    const openDate = new Date(2024, 5, 29, 0, 0, 0).getTime();
    console.log('input');
    console.log(date);
    console.log('openDate');
    console.log(openDate);

    if (openDate > date) throw new HttpException('LECTURE_NOT_OPEN', 500);
    else return true;
  }

  async isBelowMaxEntry(lectureId: number): Promise<boolean> {
    const lectureUser = await this.lectureUserTable.selectAllUsersByLectureId(lectureId);
    if (lectureUser.length >= 30) throw new HttpException('MAX_ENTRY_REACHED', 500);
    else return true;
  }

  async getUserEntry(userId: number, lectureId: number): Promise<boolean> {
    const lectureUser = await this.lectureUserTable.selectAllUsersByLectureId(lectureId);
    return lectureUser.some((entity) => entity.userId === userId) ? true : false;
  }

  @Transactional()
  async apply(userId: number, lectureId: number) {
    const body = { userId, lectureId };
    const entity = plainToInstance(LectureUser, body, { excludeExtraneousValues: true, exposeUnsetFields: false });
    const lectureUser = await this.lectureUserTable.insert(entity);
    return plainToInstance(LectureUser, lectureUser);
  }
}
