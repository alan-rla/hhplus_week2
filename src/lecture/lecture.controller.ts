import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { PostLectureDto } from './dto/post.lecture.dto';
import { LectureIdUserIdDto } from './dto/lectureId.userId.dto';
import { Lecture, LectureModel } from 'src/entities/Lecture.entity';
import { LectureUserModel } from 'src/entities/LectureUser.entity';
import { Transactional } from 'typeorm-transactional';

@Controller('lectures')
export class LectureController {
  constructor(private lectureService: LectureService) {}

  @Post()
  async createLecture(@Body() body: PostLectureDto): Promise<Lecture> {
    const name = body.name;
    const entry = body.entry;
    const openDate = body.openDate;
    const post = await this.lectureService.createLecture(name, entry, openDate);
    return post;
  }

  @Transactional()
  @Post('apply')
  async apply(@Body() body: LectureIdUserIdDto): Promise<[LectureModel, LectureUserModel]> {
    const userId = body.userId;
    const lectureId = body.lectureId;
    const lecture = await this.lectureService.lectureExists(lectureId);
    this.lectureService.isApplicationOpen(lecture.openDate);
    this.lectureService.isBelowEntry(lecture.entry);
    await this.lectureService.hasUserAlreadyApplied(lectureId, userId);
    const lectureUser = await this.lectureService.apply(userId, lectureId, lecture.entry);
    return lectureUser;
  }

  @Get(':lectureId/application/:userId')
  async getUserEntry(@Param() param: LectureIdUserIdDto): Promise<boolean> {
    const userId = param.userId;
    const lectureId = param.lectureId;
    return await this.lectureService.getUserEntry(lectureId, userId);
  }
}
