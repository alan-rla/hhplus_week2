import { Expose } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
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

  @OneToMany(() => LectureUser, (lectureUser) => lectureUser.lecture)
  lectureUser: LectureUser[];
}
