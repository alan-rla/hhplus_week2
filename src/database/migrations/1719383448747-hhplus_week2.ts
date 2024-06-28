import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class HhplusWeek21719383448747 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('hhplus_week2.Lecture', [
      new TableColumn({
        name: 'entry',
        type: 'int',
        isNullable: false,
      }),
      new TableColumn({
        name: 'openDate',
        type: 'date',
        isNullable: false,
      }),
      new TableColumn({
        name: 'createdAt',
        type: 'timestamp',
        default: 'CURRENT_TIMESTAMP',
        isNullable: false,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('hhplus_week2.Lecture', ['entry', 'openDate', 'createdAt']);
  }
}
