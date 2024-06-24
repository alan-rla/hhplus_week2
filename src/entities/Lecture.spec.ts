import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { Lecture } from './Lecture.entity';

describe('Lecture Entity', () => {
  // Lecture name string 검증
  it('should fail validation when name is not string', async () => {
    const name = 123;
    const lecture = plainToInstance(Lecture, { name });

    const errors = await validate(lecture);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isString');
  });

  // name이 없을 때 validation fail
  it('should fail validation when name is empty', async () => {
    const name = null;
    const lecture = plainToInstance(Lecture, { name });

    const errors = await validate(lecture);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  // name이 empty string('')일 때 validation fail
  it('should fail validation when name is empty string or below min length(4)', async () => {
    const name = '';
    const lecture = plainToInstance(Lecture, { name });

    const errors = await validate(lecture);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('minLength');
  });

  // name이 MaxLength(100) 이상일 때 validation fail
  it('should fail validation when name above max length(100)', async () => {
    const name =
      '[Y%MymKgNg1m)w6[1z.}keMq$3$/:Mkd.iP4Sq(Ybn#SU26H?9Eyh4w}M{@PfBCyaL.YdB/LhK_x=&Y&$J9(xjrQc=h3m_if)G-f5';
    const lecture = plainToInstance(Lecture, { name });

    const errors = await validate(lecture);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('maxLength');
  });
});
