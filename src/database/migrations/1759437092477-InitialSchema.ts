import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1759437092477 implements MigrationInterface {
    name = 'InitialSchema1759437092477'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`pedido\` (\`id_pedido\` int NOT NULL AUTO_INCREMENT, \`id_usuario\` int NOT NULL, \`numero_pedido\` varchar(50) NOT NULL, \`total\` decimal(18,2) NOT NULL, \`estado\` enum ('pendiente', 'procesando', 'completado', 'cancelado') NOT NULL DEFAULT 'pendiente', \`metodo_pago\` varchar(50) NULL, \`direccion_envio\` varchar(500) NULL, \`notas\` varchar(1000) NULL, \`fecha_pedido\` datetime(6) NOT NULL, INDEX \`IX_pedidos_fecha\` (\`fecha_pedido\`), INDEX \`IX_pedidos_usuario\` (\`id_usuario\`), UNIQUE INDEX \`IDX_57fdd2c55e1e36b4c9e509e5ff\` (\`numero_pedido\`), PRIMARY KEY (\`id_pedido\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`carrito\` (\`id_carrito\` int NOT NULL AUTO_INCREMENT, \`id_usuario\` int NOT NULL, \`esta_activo\` tinyint NOT NULL DEFAULT 1, \`fecha_creacion\` datetime(6) NOT NULL, \`fecha_actualizacion\` datetime(6) NOT NULL, INDEX \`IX_carrito_usuario\` (\`id_usuario\`), PRIMARY KEY (\`id_carrito\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`carrito_item\` (\`id_carrito_item\` int NOT NULL AUTO_INCREMENT, \`id_carrito\` int NOT NULL, \`id_producto\` int NOT NULL, \`cantidad\` int NOT NULL DEFAULT '1', \`fecha_agregado\` datetime(6) NOT NULL , UNIQUE INDEX \`UQ_carrito_item_producto\` (\`id_carrito\`, \`id_producto\`), INDEX \`IX_carrito_item_carrito\` (\`id_carrito\`), PRIMARY KEY (\`id_carrito_item\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`producto\` ADD CONSTRAINT \`FK_e87a319f3da1b6da5fedd1988be\` FOREIGN KEY (\`id_categoria\`) REFERENCES \`categoria\`(\`id_categoria\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`detalle_pedido\` ADD CONSTRAINT \`FK_358afcceb14c2f910d152a3ad2f\` FOREIGN KEY (\`id_pedido\`) REFERENCES \`pedido\`(\`id_pedido\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`detalle_pedido\` ADD CONSTRAINT \`FK_1e7d99f4f8c18bbcd15fc0fbe9b\` FOREIGN KEY (\`id_producto\`) REFERENCES \`producto\`(\`id_producto\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`pedido\` ADD CONSTRAINT \`FK_512f2a53c873366a90180938ee5\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id_usuario\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carrito\` ADD CONSTRAINT \`FK_2f59229fe3184c1a775de06d16c\` FOREIGN KEY (\`id_usuario\`) REFERENCES \`usuario\`(\`id_usuario\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carrito_item\` ADD CONSTRAINT \`FK_5298c1191dd1102005e0474f0bb\` FOREIGN KEY (\`id_carrito\`) REFERENCES \`carrito\`(\`id_carrito\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`carrito_item\` ADD CONSTRAINT \`FK_724c7a415e46b31bf0a585f7498\` FOREIGN KEY (\`id_producto\`) REFERENCES \`producto\`(\`id_producto\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`carrito_item\` DROP FOREIGN KEY \`FK_724c7a415e46b31bf0a585f7498\``);
        await queryRunner.query(`ALTER TABLE \`carrito_item\` DROP FOREIGN KEY \`FK_5298c1191dd1102005e0474f0bb\``);
        await queryRunner.query(`ALTER TABLE \`carrito\` DROP FOREIGN KEY \`FK_2f59229fe3184c1a775de06d16c\``);
        await queryRunner.query(`ALTER TABLE \`pedido\` DROP FOREIGN KEY \`FK_512f2a53c873366a90180938ee5\``);
        await queryRunner.query(`ALTER TABLE \`detalle_pedido\` DROP FOREIGN KEY \`FK_1e7d99f4f8c18bbcd15fc0fbe9b\``);
        await queryRunner.query(`ALTER TABLE \`detalle_pedido\` DROP FOREIGN KEY \`FK_358afcceb14c2f910d152a3ad2f\``);
        await queryRunner.query(`ALTER TABLE \`producto\` DROP FOREIGN KEY \`FK_e87a319f3da1b6da5fedd1988be\``);
        await queryRunner.query(`DROP INDEX \`IX_carrito_item_carrito\` ON \`carrito_item\``);
        await queryRunner.query(`DROP INDEX \`UQ_carrito_item_producto\` ON \`carrito_item\``);
        await queryRunner.query(`DROP TABLE \`carrito_item\``);
        await queryRunner.query(`DROP INDEX \`IX_carrito_usuario\` ON \`carrito\``);
        await queryRunner.query(`DROP TABLE \`carrito\``);
        await queryRunner.query(`DROP INDEX \`IDX_57fdd2c55e1e36b4c9e509e5ff\` ON \`pedido\``);
        await queryRunner.query(`DROP INDEX \`IX_pedidos_usuario\` ON \`pedido\``);
        await queryRunner.query(`DROP INDEX \`IX_pedidos_fecha\` ON \`pedido\``);
        await queryRunner.query(`DROP TABLE \`pedido\``);
    }

}
