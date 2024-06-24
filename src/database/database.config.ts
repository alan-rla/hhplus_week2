import { DataSource, DataSourceOptions } from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
  type: 'mariadb',
  host: 'localhost',
  port: 3306,
  username: 'root',
  password: '1234',
  database: 'hhplus_week2',
  logging: true,
  charset: 'utf8_general_ci', // 이모티콘 사용 가능하게 해줌
  entities: [__dirname + '/../entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/../database/migrations/*.{ts,js}'],
  synchronize: false, // 개발용 로컬 DB이므로 true
  dropSchema: false, // db에 테이블이 있다면 전부 삭제
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
