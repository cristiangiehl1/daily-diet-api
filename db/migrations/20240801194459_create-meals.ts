import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('meals', (table) => {
        table.uuid('id').primary();
        table.text('name').notNullable(); 
        table.text('description').notNullable(); 
        table.timestamp('datetime').notNullable(); 
        table.boolean('is_within_diet').notNullable(); 

        table.uuid('user_id').notNullable().references('id').inTable('users');
        
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable();
        table.timestamp('updated_at').defaultTo(knex.fn.now()).notNullable();
    });
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('meals')
}

