import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { StorageDriver, initializeTransactionalContext } from 'typeorm-transactional';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './httpException.filter';

async function bootstrap() {
  // TypeORM Transactional 적용
  initializeTransactionalContext({ storageDriver: StorageDriver.AUTO });
  const app = await NestFactory.create(AppModule);
  // Class-Validator로 인해 발생한 에러 반환하는 pipe
  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true,
      transform: true,
      // forbidNonWhitelisted: true,
      // validateCustomDecorators: true,
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        return new BadRequestException(result);
      },
    }),
  );
  // HTTP 예외처리용 필터 사용
  app.useGlobalFilters(new HttpExceptionFilter());

  await app.listen(3000);
}
bootstrap();
