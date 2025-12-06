// .../db/migrations/...criar_tabela_itens.js
exports.up = function(knex) {
  return knex.schema.createTable('itens', table => {
    table.increments('id').primary(); // ID incremental, chave primária
    table.string('nome').notNullable(); // Coluna 'nome' que não pode ser nula
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('itens');
};