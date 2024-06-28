import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { LectureTable } from './lecture.table';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from 'src/entities/Lecture.entity';
import { LectureUser } from 'src/entities/LectureUser.entity';
import { LectureUserTable } from './lecture.user.table';

@Module({
  imports: [TypeOrmModule.forFeature([Lecture, LectureUser])],
  providers: [DatabaseService, LectureTable, LectureUserTable],
  exports: [DatabaseService, LectureTable, LectureUserTable],
})
export class DatabaseModule {}
