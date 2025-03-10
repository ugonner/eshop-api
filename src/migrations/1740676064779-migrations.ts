import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1740676064779 implements MigrationInterface {
    name = 'Migrations1740676064779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`role\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
                \`permissions\` json NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_ae4578dcaed5adff96595e6166\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`auth\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`email\` varchar(255) NULL,
                \`phoneNumber\` varchar(255) NULL,
                \`password\` varchar(255) NOT NULL,
                \`userType\` varchar(255) NOT NULL DEFAULT 'Guest',
                \`status\` varchar(255) NOT NULL DEFAULT 'Inactive',
                \`userId\` varchar(255) NOT NULL,
                \`firstName\` varchar(255) NULL,
                \`lastName\` varchar(255) NULL,
                \`otp\` int NULL,
                \`otpTime\` datetime NULL,
                \`isVerified\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`roleId\` int NULL,
                \`profileId\` int NULL,
                UNIQUE INDEX \`IDX_373ead146f110f04dad6084815\` (\`userId\`),
                UNIQUE INDEX \`REL_ca49e738c1e64b0c839cae30d4\` (\`profileId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`profile\` (
                \`id\` int NOT NULL AUTO_INCREMENT,
                \`userId\` varchar(255) NOT NULL,
                \`firstName\` varchar(255) NULL,
                \`lastName\` varchar(255) NULL,
                \`avatar\` varchar(255) NULL,
                \`gender\` varchar(255) NULL,
                \`phoneNumber\` varchar(255) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\`
            ADD CONSTRAINT \`FK_b368cb67ee97687c9fdc9a04153\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\`
            ADD CONSTRAINT \`FK_ca49e738c1e64b0c839cae30d4e\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_ca49e738c1e64b0c839cae30d4e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_b368cb67ee97687c9fdc9a04153\`
        `);
        await queryRunner.query(`
            DROP TABLE \`profile\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_ca49e738c1e64b0c839cae30d4\` ON \`auth\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_373ead146f110f04dad6084815\` ON \`auth\`
        `);
        await queryRunner.query(`
            DROP TABLE \`auth\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_ae4578dcaed5adff96595e6166\` ON \`role\`
        `);
        await queryRunner.query(`
            DROP TABLE \`role\`
        `);
    }

}
