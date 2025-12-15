exports.up = function(knex) {
  // Cria a tabela 'caixas'
  return knex.schema.createTable('caixas', table => {
    table.increments('id').primary(); // ID incremental, chave primária
    table.string('nome').notNullable(); // Nome da caixa (obrigatório)
    table.string('tipo').notNullable(); // Tipo: Base, Expansão, etc. (obrigatório)
    table.integer('herois').defaultTo(0); // Número de heróis (default 0)
    table.integer('nemeis').defaultTo(0); // Número de némesis (default 0)
  });
};

exports.down = function(knex) {
  // O que fazer para reverter a migration (apagar a tabela)
  return knex.schema.dropTable('caixas');
};