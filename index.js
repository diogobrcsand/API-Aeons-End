// index.js
const express = require('express');
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
app.get('/itens', (req, res) => {
    res.status(200).json(itens); 
});

// --- 2. Rota POST: Adicionar novo item ---
app.post('/itens', (req, res) => {
    const novoItem = req.body; 

    if (novoItem.nome) {
        novoItem.id = nextId++; 
        itens.push(novoItem);
        res.status(201).json({ 
            message: 'Item criado com sucesso!', 
            item: novoItem 
        });
    } else {
        res.status(400).json({ 
            message: 'Dados inválidos. O item deve ter um campo "nome".' 
        });
    }
});

// --- 3. Rota DELETE: Remover item por ID ---
app.delete('/itens/:id', (req, res) => {
    const idParaDeletar = parseInt(req.params.id); // Pega o ID da URL e converte para número
    const tamanhoInicial = itens.length;

    // Filtra a lista, removendo o item com o ID correspondente
    itens = itens.filter(item => item.id !== idParaDeletar);

    if (itens.length < tamanhoInicial) {
        res.status(200).json({ message: `Item com ID ${idParaDeletar} removido com sucesso.` });
    } else {
        res.status(404).json({ message: 'Item não encontrado.' });
    }
});

// --- 4. Rota PUT: Atualizar item por ID ---
app.put('/itens/:id', (req, res) => {
    const idParaAtualizar = parseInt(req.params.id);
    const dadosAtualizados = req.body;
    let itemEncontrado = false;

    itens = itens.map(item => {
        if (item.id === idParaAtualizar) {
            itemEncontrado = true;
            // Retorna o item com o nome atualizado, mantendo o ID
            return { ...item, nome: dadosAtualizados.nome }; 
        }
        return item;
    });

    if (itemEncontrado) {
        res.status(200).json({ 
            message: `Item com ID ${idParaAtualizar} atualizado.`,
            item: itens.find(item => item.id === idParaAtualizar) 
        });
    } else {
        res.status(404).json({ message: 'Item não encontrado para atualização.' });
    }
});


// Inicia o servidor
app.listen(port, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});