import { Module } from '@nestjs/common';
import { DatabaseService } from './database.service';
import { LectureTable } from './lecture.table';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lecture } from 'src/entities/Lecture.entity';
import { LectureUser } from 'src/entities/LectureUser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lecture, LectureUser])],
  providers: [DatabaseService, LectureTable],
  exports: [LectureTable],
})
export class DatabaseModule {}
