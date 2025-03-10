import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1741389060959 implements MigrationInterface {
    name = 'Migrations1741389060959'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_20047fb80dc08af215fe46a909\` ON \`orders\`
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
            ALTER TABLE \`category\` CHANGE \`descripton\` \`descripton\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`category\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_329b8ae12068b23da547d3b4798\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` CHANGE \`description\` \`description\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` CHANGE \`discountRate\` \`discountRate\` decimal NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` DROP COLUMN \`attachments\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\`
            ADD \`attachments\` json NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` CHANGE \`userId\` \`userId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` DROP FOREIGN KEY \`FK_6e420052844edf3a5506d863ce6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` CHANGE \`size\` \`size\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` CHANGE \`color\` \`color\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` CHANGE \`productId\` \`productId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_646bf9ece6f45dbe41c203e06e0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_7e2fe82497aa29798b51511ada4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` CHANGE \`orderId\` \`orderId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` CHANGE \`productVariantId\` \`productVariantId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment_transaction\` DROP FOREIGN KEY \`FK_c30515be97af9ab6316b00ddeb1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment_transaction\` CHANGE \`userId\` \`userId\` int NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_20047fb80dc08af215fe46a909c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`additionalInformation\` \`additionalInformation\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`paymentTransactionId\` \`paymentTransactionId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`userId\` \`userId\` int NULL
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
            ALTER TABLE \`profile\` DROP COLUMN \`address\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\`
            ADD \`address\` json NULL
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
            ALTER TABLE \`product\`
            ADD CONSTRAINT \`FK_329b8ae12068b23da547d3b4798\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\`
            ADD CONSTRAINT \`FK_6e420052844edf3a5506d863ce6\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE \`payment_transaction\`
            ADD CONSTRAINT \`FK_c30515be97af9ab6316b00ddeb1\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`FK_20047fb80dc08af215fe46a909c\` FOREIGN KEY (\`paymentTransactionId\`) REFERENCES \`payment_transaction\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_151b79a83ba240b0cb31b2302d1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` DROP FOREIGN KEY \`FK_20047fb80dc08af215fe46a909c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment_transaction\` DROP FOREIGN KEY \`FK_c30515be97af9ab6316b00ddeb1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_7e2fe82497aa29798b51511ada4\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` DROP FOREIGN KEY \`FK_646bf9ece6f45dbe41c203e06e0\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` DROP FOREIGN KEY \`FK_6e420052844edf3a5506d863ce6\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` DROP FOREIGN KEY \`FK_329b8ae12068b23da547d3b4798\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_ca49e738c1e64b0c839cae30d4e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`auth\` DROP FOREIGN KEY \`FK_b368cb67ee97687c9fdc9a04153\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\` DROP COLUMN \`address\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`profile\`
            ADD \`address\` longtext COLLATE "utf8mb4_bin" NOT NULL
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
            ALTER TABLE \`orders\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`paymentTransactionId\` \`paymentTransactionId\` varchar(36) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`createdAt\` \`createdAt\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP()
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\` CHANGE \`additionalInformation\` \`additionalInformation\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`FK_151b79a83ba240b0cb31b2302d1\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`orders\`
            ADD CONSTRAINT \`FK_20047fb80dc08af215fe46a909c\` FOREIGN KEY (\`paymentTransactionId\`) REFERENCES \`payment_transaction\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment_transaction\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`payment_transaction\`
            ADD CONSTRAINT \`FK_c30515be97af9ab6316b00ddeb1\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` CHANGE \`productVariantId\` \`productVariantId\` varchar(36) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\` CHANGE \`orderId\` \`orderId\` varchar(36) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\`
            ADD CONSTRAINT \`FK_7e2fe82497aa29798b51511ada4\` FOREIGN KEY (\`productVariantId\`) REFERENCES \`product_variant\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`order_item\`
            ADD CONSTRAINT \`FK_646bf9ece6f45dbe41c203e06e0\` FOREIGN KEY (\`orderId\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` CHANGE \`productId\` \`productId\` varchar(36) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` CHANGE \`color\` \`color\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\` CHANGE \`size\` \`size\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product_variant\`
            ADD CONSTRAINT \`FK_6e420052844edf3a5506d863ce6\` FOREIGN KEY (\`productId\`) REFERENCES \`product\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` CHANGE \`userId\` \`userId\` int NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` DROP COLUMN \`attachments\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\`
            ADD \`attachments\` longtext COLLATE "utf8mb4_bin" NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` CHANGE \`discountRate\` \`discountRate\` decimal(10, 0) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\` CHANGE \`description\` \`description\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`product\`
            ADD CONSTRAINT \`FK_329b8ae12068b23da547d3b4798\` FOREIGN KEY (\`userId\`) REFERENCES \`profile\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`category\` CHANGE \`imageUrl\` \`imageUrl\` varchar(255) NULL DEFAULT 'NULL'
        `);
        await queryRunner.query(`
            ALTER TABLE \`category\` CHANGE \`descripton\` \`descripton\` varchar(255) NULL DEFAULT 'NULL'
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
            CREATE UNIQUE INDEX \`IDX_20047fb80dc08af215fe46a909\` ON \`orders\` (\`paymentTransactionId\`)
        `);
    }

}
