import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCoursesTable1786281986328 implements MigrationInterface {
    name = 'CreateCoursesTable1786281986328'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "courses" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "availableSeats" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_3f70a487cc718ad8eda4e6d58c9" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "courses"`);
    }

}
