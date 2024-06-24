import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Lecture } from 'src/entities/Lecture.entity';

import { InsertResult, Repository } from 'typeorm';
import { Propagation, Transactional } from 'typeorm-transactional';

@Injectable()
export class LectureTable {
  constructor(
    @InjectRepository(Lecture)
    private lectureRepository: Repository<Lecture>,
  ) {}

  @Transactional({ propagation: Propagation.MANDATORY })
  async insert(lecture: Lecture): Promise<InsertResult> {
    const insert = await this.lectureRepository
      .createQueryBuilder()
      .insert()
      .into(Lecture)
      .values(lecture)
      .returning('*')
      .execute();
    return insert.raw[0];
  }

  async selectAll(): Promise<Lecture[]> {
    const lecture = await this.lectureRepository.createQueryBuilder('lecture').getMany();
    return lecture;
  }
}
