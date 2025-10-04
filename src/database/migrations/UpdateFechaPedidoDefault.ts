import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateFechaPedidoDefault1704500000000 implements MigrationInterface {
    name = 'UpdateFechaPedidoDefault1704500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE pedido 
            MODIFY COLUMN fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE pedido 
            MODIFY COLUMN fecha_pedido DATETIME NOT NULL
        `);
    }
}
