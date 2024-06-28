import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LectureUser } from './LectureUser.entity';

describe('LectureUser Entity', () => {
  // param으로 쓰일 경우 @Type(() => Number)에 의해 자동으로 숫자로 변경됨
  // 테스트는 string, number 두가지 다 진행
  // float일 때 validation fail
  it('should fail validation when ids are not integers', async () => {
    const userId = 1.1;
    const lectureId = '1.1';
    const lectureUser = plainToInstance(LectureUser, { userId, lectureId });

    const errors = await validate(lectureUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isInt');
  });

  // 음수일 때 validation fail
  it('should fail validation when ids are not positive', async () => {
    const userId = -1;
    const lectureId = '-1';
    const lectureUser = plainToInstance(LectureUser, { userId, lectureId });

    const errors = await validate(lectureUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isPositive');
  });

  // 0일 때 validation fail
  it('should fail validation when ids are zero', async () => {
    const userId = 0;
    const lectureId = '0';
    const lectureUser = plainToInstance(LectureUser, { userId, lectureId });

    const errors = await validate(lectureUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isPositive');
  });

  // 없을 때 validation fail
  it('should fail validation when ids are empty', async () => {
    const lectureUser = plainToInstance(LectureUser, {});

    const errors = await validate(lectureUser);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });
});
