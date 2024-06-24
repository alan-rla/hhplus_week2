import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

@Injectable()
export class DatabaseService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions | Promise<TypeOrmModuleOptions> {
    return {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '1234',
      database: 'hhplus_week2',
      logging: true,
      charset: 'utf8_general_ci',
      keepConnectionAlive: true,
      entities: [__dirname + '/../entities/*.{ts,js}'],
      migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
      synchronize: false,
      dropSchema: false,
      timezone: '+09.00',
    };
  }
}
