import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741167709482 implements MigrationInterface {
    name = 'Migrations1741167709482'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`product_tag\` DROP FOREIGN KEY \`FK_7bf0b673c19b33c9456d54b2b37\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\` DROP FOREIGN KEY \`FK_d08cb260c60a9bf0a5e0424768d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_0374879a971928bc3f57eed0a59\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\` DROP FOREIGN KEY \`FK_2df1f83329c00e6eadde0493e16\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`category\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`descripton\` varchar(255) NULL,
                \`imageUrl\` varchar(255) NULL,
                UNIQUE INDEX \`IDX_23c05c292c439d77b0de816b50\` (\`name\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`order_item\` (
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
            CREATE TABLE \`product_variant\` (
                \`id\` varchar(36) NOT NULL,
                \`size\` varchar(255) NULL,
                \`color\` varchar(255) NULL,
                \`price\` decimal(10, 2) NOT NULL DEFAULT '0.00',
                \`stock\` int NOT NULL DEFAULT '0',
                \`productVariantType\` varchar(255) NOT NULL DEFAULT 'Base_product',
                \`productId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`product\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                \`description\` varchar(255) NULL,
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
            CREATE TABLE \`tag\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(255) NOT NULL,
                UNIQUE INDEX \`IDX_6a9775008add570dc3e5a0bab7\` (\`name\`),
                PRIMARY KEY (\`id\`)
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
            ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`userId\` \`userId\` int NULL
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
            ALTER TABLE \`order_item\`
            ADD CONSTRAINT \`FK_646bf9ece6f45dbe41c203e06e0\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\`
            ADD CONSTRAINT \`FK_7e2fe82497aa29798b51511ada4\` FOREIGN KEY (\`productVariantId\`) REFERENCES \`product_variant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\`
            ADD CONSTRAINT \`FK_6e420052844edf3a5506d863ce6\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\`
            ADD CONSTRAINT \`FK_329b8ae12068b23da547d3b4798\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\`
            ADD CONSTRAINT \`FK_d08cb260c60a9bf0a5e0424768d\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\`
            ADD CONSTRAINT \`FK_7bf0b673c19b33c9456d54b2b37\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tag\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\`
            ADD CONSTRAINT \`FK_0374879a971928bc3f57eed0a59\` FOREIGN KEY (\`product_id\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\`
            ADD CONSTRAINT \`FK_2df1f83329c00e6eadde0493e16\` FOREIGN KEY (\`category_id\`) REFERENCES \`category\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_329b8ae12068b23da547d3b4798\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` DROP FOREIGN KEY \`FK_6e420052844edf3a5506d863ce6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_7e2fe82497aa29798b51511ada4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_646bf9ece6f45dbe41c203e06e0\`
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
            ALTER TABLE \`orders\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            DROP INDEX \`IDX_6a9775008add570dc3e5a0bab7\` ON \`tag\`
        `);
        await queryRunner.query(`
            DROP TABLE \`tag\`
        `);
        await queryRunner.query(`
            DROP TABLE \`product\`
        `);
        await queryRunner.query(`
            DROP TABLE \`product_variant\`
        `);
        await queryRunner.query(`
            DROP TABLE \`order_item\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_23c05c292c439d77b0de816b50\` ON \`category\`
        `);
        await queryRunner.query(`
            DROP TABLE \`category\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\`
            ADD CONSTRAINT \`FK_2df1f83329c00e6eadde0493e16\` FOREIGN KEY (\`category_id\`) REFERENCES \`categories\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_category\`
            ADD CONSTRAINT \`FK_0374879a971928bc3f57eed0a59\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\`
            ADD CONSTRAINT \`FK_d08cb260c60a9bf0a5e0424768d\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_tag\`
            ADD CONSTRAINT \`FK_7bf0b673c19b33c9456d54b2b37\` FOREIGN KEY (\`tag_id\`) REFERENCES \`tags\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
