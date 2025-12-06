// index.js
const express = require('express');
// 1. Configura o Knex
const knexConfig = require('./knexfile');
const db = require('knex')(knexConfig.development);
const app = express();
const port = 3000;

// Middleware para que a API entenda o corpo da requisição em formato JSON
app.use(express.json());

// --- Simulação de Banco de Dados (Lista em memória) ---
let itens = [
    { id: 1, nome: "Livro de Node.js" },
    { id: 2, nome: "Mouse sem fio" }
];
let nextId = 3; // Contador para novos IDs

// --- 1. Rota GET: Listar todos os itens ---
app.get('/itens', async(req, res) => {
   const nomeBusca = req.query.nome;

    let query = db('itens'); // Inicia a query na tabela 'itens'

    if (nomeBusca) {
        // Adiciona a condição WHERE LIKE (Busca por nome)
        query = query.where('nome', 'like', `%${nomeBusca}%`); 
    }

    try {
        const itens = await query.select('*'); // Executa a consulta
        res.status(200).json(itens);
    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar itens', error: error.message });
    } 
});

// --- 2. Rota POST: Adicionar novo item ---
app.post('/itens', async(req, res) => {
   const novoItem = req.body;

    if (novoItem.nome) {
        try {
            // Insere e retorna o ID do novo item (depende do SQLite)
            const [id] = await db('itens').insert(novoItem); 
            const itemCriado = await db('itens').where('id', id).first();

            res.status(201).json({ 
                message: 'Item criado e salvo em disco!', 
                item: itemCriado 
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao salvar item', error: error.message });
        }
    } else {
        res.status(400).json({ message: 'O item deve ter um campo "nome".' });
    }
});

// --- 3. Rota DELETE: Remover item por ID ---
app.delete('/itens/:id', async(req, res) => {
    const idParaDeletar = parseInt(req.params.id); // Pega o ID da URL e converte para número

try {
        // 1. Knex monta o comando SQL: DELETE FROM itens WHERE id = [idParaDeletar]
        const count = await db('itens').where('id', idParaDeletar).del(); 

        if (count > 0) {
            res.status(200).json({ message: `Item com ID ${idParaDeletar} removido do banco de dados.` });
        } else {
            res.status(404).json({ message: 'Item não encontrado no banco de dados.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao deletar item.' });
    }
});

// --- 4. Rota PUT: Atualizar item por ID ---
app.put('/itens/:id', async (req, res) => { // NOTE o 'async'
    const idParaAtualizar = parseInt(req.params.id);
    const dadosAtualizados = req.body; // { "nome": "Novo Nome" }

    if (!dadosAtualizados.nome) {
        return res.status(400).json({ message: 'O corpo da requisição deve conter o campo "nome".' });
    }

    try {
        // 1. Knex monta o comando SQL: UPDATE itens SET nome = '...' WHERE id = [idParaAtualizar]
        const count = await db('itens')
            .where('id', idParaAtualizar)
            .update(dadosAtualizados); 

        if (count > 0) {
            // 2. Se a atualização ocorreu (count > 0), buscamos o item atualizado para retornar
            const itemAtualizado = await db('itens')
                .where('id', idParaAtualizar)
                .first();
                
            res.status(200).json({ 
                message: `Item com ID ${idParaAtualizar} atualizado.`, 
                item: itemAtualizado 
            });
        } else {
            // 3. Se count for 0, o item não foi encontrado
            res.status(404).json({ message: 'Item não encontrado para atualização.' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Erro ao atualizar item.', error: error.message });
    }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});