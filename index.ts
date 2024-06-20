const express = require('express');
const app = express();

app.use(express.json()); // Para parsear o corpo das requisições JSON

app.get('/', (request, response) => {
    return response.json({ message: "Servidor funcionando" });
});

app.post('/teste', (request, response) => {
    const { name, date } = request.body;
    return response.json({ name, date });
});

app.listen(3333, () => {
    console.log('Servidor está executando na porta 3333');
});
