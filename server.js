
const express = require('express');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const app = express();

const banco = new DatabaseSync(path.join(__dirname, 'tarefas.db'));

banco.exec(`
    CREATE TABLE IF NOT EXISTS tarefas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        titulo TEXT NOT NULL,
        concluida INTEGER DEFAULT 0
    )
`);

app.use(express.json());
app.use(express.static(__dirname));

// CADASTRAR TAREFA
app.post('/tarefas', (requisicao, resposta) => {
    const titulo = requisicao.body.titulo;

    if (!titulo) {
        return resposta.status(400).json({ erro: 'Digite um título' });
    }

    banco.prepare('INSERT INTO tarefas (titulo) VALUES (?)').run(titulo);

    resposta.json({ ok: true });
});

// LISTAR TAREFAS
app.get('/tarefas', (requisicao, resposta) => {
    const tarefas = banco.prepare(
        'SELECT * FROM tarefas ORDER BY id DESC'
    ).all();

    resposta.json(tarefas);
});

// ATUALIZAR TAREFA
app.put('/tarefas/:id', (requisicao, resposta) => {
    const id = requisicao.params.id;
    const concluida = requisicao.body.concluida;

    banco.prepare(
        'UPDATE tarefas SET concluida = ? WHERE id = ?'
    ).run(concluida, id);

    resposta.json({ ok: true });
});

// APAGAR TAREFA
app.delete('/tarefas/:id', (requisicao, resposta) => {
    const id = requisicao.params.id;

    banco.prepare('DELETE FROM tarefas WHERE id = ?').run(id);

    resposta.json({ ok: true });
});

// INICIAR SERVIDOR
app.listen(3000, () => {
    console.log('Servidor rodando em http://localhost:3000');
});
