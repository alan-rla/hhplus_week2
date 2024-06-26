import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { LectureService } from './lecture.service';
import { PostLectureDto } from './dto/post.lecture.dto';
import { LectureIdUserIdDto } from './dto/lectureId.userId.dto';
import { Lecture } from 'src/entities/Lecture.entity';
import { LectureUser } from 'src/entities/LectureUser.entity';

@Controller('lectures')
export class LectureController {
  constructor(private lectureService: LectureService) {}

  @Post()
  async createLecture(@Body() body: PostLectureDto): Promise<Lecture> {
    const name = body.name;
    const post = await this.lectureService.postLecture(name);
    return post;
  }

  @Post('apply')
  async apply(@Body() body: LectureIdUserIdDto): Promise<LectureUser> {
    const userId = body.userId;
    const lectureId = body.lectureId;
    const now = Date.now();
    await this.lectureService.isApplicationOpen(now);
    await this.lectureService.lectureExists(lectureId);
    await this.lectureService.isBelowMaxEntry(lectureId);
    const lectureUser = await this.lectureService.apply(userId, lectureId);
    return lectureUser;
  }

  @Get('application/:userId')
  async getUserEntry(@Param() param: LectureIdUserIdDto): Promise<boolean> {
    const userId = param.userId;
    // Step03에서 특강 1개로 간주하기 때문에 하드코딩
    // TODO: param에 lectureId 추가
    const lectureId = 1;
    return await this.lectureService.getUserEntry(userId, lectureId);
  }
}
