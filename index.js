// index.js
const express = require('express');
// 1. Configura o Knex
const knexConfig = require('./knexfile');
const db = require('knex')(knexConfig.development);
const app = express();
const port = 3000;

// Middleware para que a API entenda o corpo da requisição em formato JSON
app.use(express.json());

// ----------------------------------------------------------------------
// ROTA 1: POST /caixas (Criação de Caixa Detalhada)
// ----------------------------------------------------------------------
app.post('/caixas', async (req, res) => {
    // 1. Desestrutura os campos conforme o novo modelo
    const { nome, tipo, herois, nemeis } = req.body;
    
    // 2. Validação básica de campos obrigatórios
    if (!nome || !tipo) {
        return res.status(400).json({ message: 'Os campos "nome" e "tipo" são obrigatórios.' });
    }

    try {
        // 3. Monta o objeto para inserção, usando valores padrão (0) se não fornecidos
        const caixaParaInserir = { 
            nome, 
            tipo, 
            herois: herois || 0, // Garante que é 0 se for nulo/undefined
            nemeis: nemeis || 0 
        };
        
        // 4. Insere no banco de dados na nova tabela 'caixas'
        const [id] = await db('caixas').insert(caixaParaInserir);
        
        // 5. Busca o item inserido (necessário no SQLite para obter o objeto completo)
        const caixaCriada = await db('caixas').where('id', id).first();

        res.status(201).json({ 
            message: 'Caixa registrada com sucesso!', 
            caixa: caixaCriada 
        });

    } catch (error) {
        console.error('Erro no POST /caixas:', error);
        res.status(500).json({ message: 'Erro interno ao registrar a caixa.', error: error.message });
    }
});

// ----------------------------------------------------------------------
// ROTA 2: GET /caixas (Listar Todas as Caixas)
// ----------------------------------------------------------------------
app.get('/caixas', async (req, res) => {
    try {
        // Seleciona todos os registros da tabela 'caixas'
        const caixas = await db('caixas').select('*'); 
        
        res.status(200).json(caixas);
    } catch (error) {
        console.error('Erro no GET /caixas:', error);
        res.status(500).json({ message: 'Erro ao buscar caixas.', error: error.message });
    }
});

// ----------------------------------------------------------------------
// ROTA 3: DELETE /caixas/:id (Deletar Caixa por ID)
// ----------------------------------------------------------------------
app.delete('/caixas/:id', async (req, res) => {
    const idParaDeletar = parseInt(req.params.id);

    try {
        // Deleta o registro onde o ID corresponde, e retorna o número de linhas deletadas (count)
        const count = await db('caixas').where('id', idParaDeletar).del(); 

        if (count > 0) {
            res.status(200).json({ message: `Caixa com ID ${idParaDeletar} removida com sucesso.` });
        } else {
            res.status(404).json({ message: 'Caixa não encontrada para exclusão.' });
        }
    } catch (error) {
        console.error('Erro no DELETE /caixas:', error);
        res.status(500).json({ message: 'Erro ao deletar caixa.', error: error.message });
    }
});

// ----------------------------------------------------------------------
// ROTA 4: PUT /caixas/:id (Atualização de Caixa)
// ----------------------------------------------------------------------
app.put('/caixas/:id', async (req, res) => { // É crucial que seja 'async'
    const idParaAtualizar = parseInt(req.params.id);
    const dadosAtualizados = req.body; // Objeto com os novos dados: {nome: "...", herois: 5}

    // 1. Opcional, mas recomendado: Evitar requisições vazias
    if (Object.keys(dadosAtualizados).length === 0) {
        return res.status(400).json({ message: 'Forneça dados para atualizar (nome, tipo, herois ou nemeis).' });
    }

    try {
        // 2. Executa a atualização:
        //    Localiza a caixa pelo ID e usa os 'dadosAtualizados' para preencher as colunas
        const count = await db('caixas')
            .where('id', idParaAtualizar)
            .update(dadosAtualizados); 

        if (count > 0) {
            // 3. Se a atualização funcionou, busca o item atualizado para retornar
            const caixaAtualizada = await db('caixas')
                .where('id', idParaAtualizar)
                .first();
                
            res.status(200).json({ 
                message: `Caixa com ID ${idParaAtualizar} atualizada com sucesso.`, 
                caixa: caixaAtualizada 
            });
        } else {
            // 4. Se count for 0, o ID não foi encontrado no DB
            res.status(404).json({ message: 'Caixa não encontrada para atualização.' });
        }
    } catch (error) {
        console.error('Erro no PUT /caixas:', error);
        res.status(500).json({ message: 'Erro ao atualizar caixa.', error: error.message });
    }
});

// ----------------------------------------------------------------------
// ROTA 5: GET /caixas/:id (Busca Caixa por ID) colocar ID
// ----------------------------------------------------------------------
app.get('/caixas/:id', async (req, res) => { 
    const idBuscado = parseInt(req.params.id);

    try {
        // Busca o primeiro registro na tabela 'caixas' onde o ID corresponde
        const caixa = await db('caixas').where('id', idBuscado).first(); 

        if (caixa) {
            res.status(200).json(caixa);
        } else {
            res.status(404).json({ message: `Caixa com ID ${idBuscado} não encontrada.` });
        }
    } catch (error) {
        console.error('Erro no GET /caixas/:id:', error);
        res.status(500).json({ message: 'Erro ao buscar caixa.', error: error.message });
    }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});