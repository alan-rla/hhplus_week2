import { Expose, Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Lecture } from './Lecture.entity';

@Entity({ name: 'LectureUser', schema: 'hhplus_week2' })
export class LectureUser {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Expose()
  @Column('int', { name: 'name' })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  userId: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Lecture, (lecture) => lecture.lectureUser)
  @JoinColumn([{ name: 'lectureId', referencedColumnName: 'id' }])
  lecture: Lecture;
  @Expose()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  lectureId: number;
}
