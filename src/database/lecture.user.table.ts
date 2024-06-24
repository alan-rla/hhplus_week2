import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LectureUser } from 'src/entities/LectureUser.entity';
import { InsertResult, Repository } from 'typeorm';
import { Propagation, Transactional } from 'typeorm-transactional';

@Injectable()
export class LectureUserTable {
  constructor(
    @InjectRepository(LectureUser)
    private lectureUserRepository: Repository<LectureUser>,
  ) {}

  @Transactional({ propagation: Propagation.MANDATORY })
  async insert(lectureUser: LectureUser): Promise<InsertResult> {
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
}
