import { MigrationInterface, QueryRunner } from "typeorm";

export class AddApplicationStatusToStudents1786280214136 implements MigrationInterface {
    name = 'AddApplicationStatusToStudents1786280214136'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" ADD "applicationStatus" character varying NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "students" DROP COLUMN "applicationStatus"`);
    }

}
