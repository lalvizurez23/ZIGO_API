import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFechaAgregadoToCarritoItem1703000000000 implements MigrationInterface {
    name = 'AddFechaAgregadoToCarritoItem1703000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE carrito_item 
            MODIFY COLUMN fecha_agregado DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE carrito_item 
            MODIFY COLUMN fecha_agregado DATETIME NOT NULL
        `);
    }
}
