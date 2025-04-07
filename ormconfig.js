
const dotenv = require("dotenv");
const { DataSource } = require("typeorm");
dotenv.config();

const typeOrmConfig = {
    type: "mysql",
    
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT),
    username: process.env.DATABASE_USER,
    password: process.env.DB_PASS,
    database: process.env.DATABASE_NAME,
    autoLoadEntities: true,
    entities: ["dist/**/*.entity.js"],
    migrations: ["dist/migrations/**/*.js"],
    //"subscribers": ["dist/subscribesr/**/*.js"],
    cli: {
      entitiesDir: "src/entities",
      migrationsDir: "dist/migrations",
      //"subscribersDir": "src/subscriber"
    },
};
//export {typeOrmConfig};
module.exports = new DataSource(typeOrmConfig);