import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741126776657 implements MigrationInterface {
    name = 'Migrations1741126776657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`tags\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_d90243459a697eadb8ad56e909\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`categories\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_8b0be371d28245da6e4f4b6187\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`orders\` (
                \`id\` varchar(36) NOT NULL,
                \`totalAmount\` decimal(10, 2) NOT NULL DEFAULT '0.00',
                \`deliveryAddress\` json NOT NULL,
                \`orderStatus\` varchar(255) NOT NULL DEFAULT 'Pending',
                \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`userId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`order_items\` (
                \`id\` varchar(36) NOT NULL,
                \`quantity\` int NOT NULL DEFAULT '1',
                \`price\` decimal(10, 2) NOT NULL,
                \`totalAmount\` decimal(10, 2) NOT NULL,
                \`orderId\` varchar(36) NULL,
                \`productVariantId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`product_variants\` (
                \`id\` varchar(36) NOT NULL,
                \`size\` varchar(255) NOT NULL,
                \`color\` varchar(255) NOT NULL,
                \`price\` decimal(10, 2) NOT NULL,
                \`stock\` int NOT NULL DEFAULT '0',
                \`productId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`products\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NOT NULL,
                \`discountRate\` decimal NULL,
                \`isPublished\` tinyint NOT NULL DEFAULT 0,
                \`isDeleted\` tinyint NOT NULL DEFAULT 0,
                \`imageUrl\` varchar(255) NOT NULL,
                \`attachments\` json NULL,
                \`userId\` int NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`product_tag\` (
                \`product_id\` varchar(36) NOT NULL,
                \`tag_id\` varchar(36) NOT NULL,
                INDEX \`IDX_d08cb260c60a9bf0a5e0424768\` (\`product_id\`),
                INDEX \`IDX_7bf0b673c19b33c9456d54b2b3\` (\`tag_id\`),
                PRIMARY KEY (\`product_id\`, \`tag_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`product_category\` (
                \`product_id\` varchar(36) NOT NULL,
                \`category_id\` varchar(36) NOT NULL,
                INDEX \`IDX_0374879a971928bc3f57eed0a5\` (\`product_id\`),
                INDEX \`IDX_2df1f83329c00e6eadde0493e1\` (\`category_id\`),
                PRIMARY KEY (\`product_id\`, \`category_id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`role\` CHANGE \`description\` \`description\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`role\` DROP COLUMN \`permissions\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`role\`
            ADD \`permissions\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_b368cb67ee97687c9fdc9a04153\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_ca49e738c1e64b0c839cae30d4e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`email\` \`email\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`firstName\` \`firstName\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`lastName\` \`lastName\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`otp\` \`otp\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`otpTime\` \`otpTime\` datetime NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`roleId\` \`roleId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`profileId\` \`profileId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`firstName\` \`firstName\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`lastName\` \`lastName\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`gender\` \`gender\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\`
            ADD CONSTRAINT \`FK_b368cb67ee97687c9fdc9a04153\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\`
            ADD CONSTRAINT \`FK_ca49e738c1e64b0c839cae30d4e\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_items\`
            ADD CONSTRAINT \`FK_f1d359a55923bb45b057fbdab0d\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_items\`
            ADD CONSTRAINT \`FK_9cf6578d9f8c7f43cc96c7af6d8\` FOREIGN KEY (\`productVariantId\`) REFERENCES \`product_variants\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variants\`
            ADD CONSTRAINT \`FK_f515690c571a03400a9876600b5\` FOREIGN KEY (\`productId\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`products\`
            ADD CONSTRAINT \`FK_99d90c2a483d79f3b627fb1d5e9\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\`
            ADD CONSTRAINT \`FK_d08cb260c60a9bf0a5e0424768d\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\`
            ADD CONSTRAINT \`FK_7bf0b673c19b33c9456d54b2b37\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\`
            ADD CONSTRAINT \`FK_0374879a971928bc3f57eed0a59\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\`
            ADD CONSTRAINT \`FK_2df1f83329c00e6eadde0493e16\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_2df1f83329c00e6eadde0493e16\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_0374879a971928bc3f57eed0a59\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\` DROP FOREIGN KEY \`FK_7bf0b673c19b33c9456d54b2b37\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\` DROP FOREIGN KEY \`FK_d08cb260c60a9bf0a5e0424768d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`products\` DROP FOREIGN KEY \`FK_99d90c2a483d79f3b627fb1d5e9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variants\` DROP FOREIGN KEY \`FK_f515690c571a03400a9876600b5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_9cf6578d9f8c7f43cc96c7af6d8\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_items\` DROP FOREIGN KEY \`FK_f1d359a55923bb45b057fbdab0d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_ca49e738c1e64b0c839cae30d4e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_b368cb67ee97687c9fdc9a04153\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`gender\` \`gender\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`avatar\` \`avatar\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`lastName\` \`lastName\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` CHANGE \`firstName\` \`firstName\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`profileId\` \`profileId\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`roleId\` \`roleId\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`otpTime\` \`otpTime\` datetime NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`otp\` \`otp\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`lastName\` \`lastName\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`firstName\` \`firstName\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`phoneNumber\` \`phoneNumber\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` CHANGE \`email\` \`email\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\`
            ADD CONSTRAINT \`FK_ca49e738c1e64b0c839cae30d4e\` FOREIGN KEY (\`profileId\`) REFERENCES \`profile\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\`
            ADD CONSTRAINT \`FK_b368cb67ee97687c9fdc9a04153\` FOREIGN KEY (\`roleId\`) REFERENCES \`role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`role\` DROP COLUMN \`permissions\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`role\`
            ADD \`permissions\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`role\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2df1f83329c00e6eadde0493e1\` ON \`product_category\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0374879a971928bc3f57eed0a5\` ON \`product_category\`
        `);
        await queryRunner.query(`
            DROP TABLE \`product_category\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7bf0b673c19b33c9456d54b2b3\` ON \`product_tag\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d08cb260c60a9bf0a5e0424768\` ON \`product_tag\`
        `);
        await queryRunner.query(`
            DROP TABLE \`product_tag\`
        `);
        await queryRunner.query(`
            DROP TABLE \`products\`
        `);
        await queryRunner.query(`
            DROP TABLE \`product_variants\`
        `);
        await queryRunner.query(`
            DROP TABLE \`order_items\`
        `);
        await queryRunner.query(`
            DROP TABLE \`orders\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8b0be371d28245da6e4f4b6187\` ON \`categories\`
        `);
        await queryRunner.query(`
            DROP TABLE \`categories\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_d90243459a697eadb8ad56e909\` ON \`tags\`
        `);
        await queryRunner.query(`
            DROP TABLE \`tags\`
        `);
    }

}
