import { PickType } from '@nestjs/swagger';
import { Lecture } from 'src/entities/Lecture.entity';

export class PostLectureDto extends PickType(Lecture, ['name', 'entry', 'openDate']) {}
