import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LectureUser, LectureUserModel } from 'src/entities/LectureUser.entity';
import { Repository } from 'typeorm';
import { Propagation, Transactional } from 'typeorm-transactional';

@Injectable()
export class LectureUserTable {
  constructor(
    @InjectRepository(LectureUser)
    private lectureUserRepository: Repository<LectureUser>,
  ) {}

  @Transactional({ propagation: Propagation.MANDATORY })
  async insert(lectureUser: LectureUser): Promise<LectureUserModel> {
    const insert = await this.lectureUserRepository
      .createQueryBuilder()
      .insert()
      .into(LectureUser)
      .values(lectureUser)
      .returning('*')
      .execute();
    return insert.raw[0];
  }

  async selectByUserId(userId: number): Promise<LectureUser> {
    const lectureUser = await this.lectureUserRepository
      .createQueryBuilder('lectureUser')
      .where('lectureUser.userId = :userId', { userId })
      .getOne();
    return lectureUser;
  }

  async selectByLectureIdUserId(lectureId: number, userId: number): Promise<LectureUser> {
    const lectureUser = await this.lectureUserRepository
      .createQueryBuilder('lectureUser')
      .where('lectureUser.lectureId = :lectureId', { lectureId })
      .andWhere('lectureUser.userId = :userId', { userId })
      .getOne();
    return lectureUser;
  }
}
