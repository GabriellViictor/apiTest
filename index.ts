import express, { Request, Response } from 'express';

const app = express();

app.get('/', (request: Request, response: Response) => {
    return response.json({ message: "Servidor funcionando" });
});

app.post('/teste', (request: Request, response: Response) => {
    const { name, date } = request.body;
    return response.json({ name, date });
});

app.listen(3333, () => {
    console.log('Servidor rodando na porta 3333');
});
