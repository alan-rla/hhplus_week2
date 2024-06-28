import { PickType } from '@nestjs/swagger';
import { LectureUser } from 'src/entities/LectureUser.entity';

export class LectureIdUserIdDto extends PickType(LectureUser, ['userId', 'lectureId']) {}
