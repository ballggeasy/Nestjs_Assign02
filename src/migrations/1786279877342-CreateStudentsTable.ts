import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateStudentsTable1786279877342 implements MigrationInterface {
    name = 'CreateStudentsTable1786279877342'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "students" ("id" SERIAL NOT NULL, "studentId" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, CONSTRAINT "UQ_9d9f010d4d6a6eea8b4779638c4" UNIQUE ("studentId"), CONSTRAINT "UQ_25985d58c714a4a427ced57507b" UNIQUE ("email"), CONSTRAINT "PK_7d7f07271ad4ce999880713f05e" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "students"`);
    }

}
