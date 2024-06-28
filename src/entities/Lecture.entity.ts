import { Expose } from 'class-transformer';
import { IsDateString, IsInt, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LectureUser } from './LectureUser.entity';

@Entity({ name: 'Lecture', schema: 'hhplus_week2' })
export class Lecture {
  @Expose()
  @PrimaryGeneratedColumn({ type: 'int', name: 'id' })
  id: number;

  @Expose()
  @Column('varchar', { name: 'name', length: 100 })
  @IsString()
  @MinLength(4)
  @MaxLength(100)
  @IsNotEmpty()
  name: string;

  @Expose()
  @Column('int', { name: 'entry' })
  @IsInt()
  @IsNotEmpty()
  entry: number;

  @Expose()
  @Column({ name: 'openDate', type: 'datetime' })
  @IsDateString()
  @IsNotEmpty()
  openDate: Date;

  @Expose()
  @CreateDateColumn({ type: 'timestamp' })
  createdAt: number;

  @OneToMany(() => LectureUser, (lectureUser) => lectureUser.lecture)
  lectureUser: LectureUser[];
}

export type LectureModel = Pick<Lecture, 'id' | 'name' | 'entry' | 'openDate' | 'createdAt'>;
