import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

export class AddEmailToProfile1740693026815 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const hasColumn = await queryRunner.hasColumn("profile", "email");
        if(!hasColumn){
            await queryRunner.addColumn("profile", new TableColumn({
                type: "varchar",
                name: "email",
            }))
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        const hasColumn = await queryRunner.hasColumn("profile", "email");
        if(hasColumn) await queryRunner.dropColumn("profile", "email");
    }

}
