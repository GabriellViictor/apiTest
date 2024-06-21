import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3333;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/minha_base_de_dados');

const UserSchema = new mongoose.Schema({
    login: String,
    senha: String,
});

const UserModel = mongoose.model('User', UserSchema);

const HorarioSchema = new mongoose.Schema({
    horario: String,
    disponivel: Boolean,
});

const HorarioModel = mongoose.model('Horario', HorarioSchema);

app.post('/login', async (req: Request, res: Response) => {
    const { login, senha } = req.body;

    try {
        const user = await UserModel.findOne({ login, senha });

        if (user) {
            res.json({ message: 'Login bem-sucedido' });
        } else {
            res.status(401).json({ message: 'Credenciais inválidas' });
        }
    } catch (err) {
        console.error('Erro ao processar login:', err);
        res.status(500).json({ message: 'Erro ao processar login' });
    }
});

// Rota para buscar horários disponíveis
app.get('/horarios-disponiveis', async (req: Request, res: Response) => {
    try {
        const horariosDisponiveis = await HorarioModel.find({ disponivel: true });
        res.json(horariosDisponiveis);
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        res.status(500).json({ message: 'Erro ao buscar horários disponíveis' });
    }
});

// Rota para marcar um horário como ocupado
app.post('/marcar-horario', async (req: Request, res: Response) => {
    const { horario } = req.body;

    try {
        const horarioMarcado = await HorarioModel.findOneAndUpdate(
            { horario, disponivel: true },
            { disponivel: false },
            { new: true }
        );

        if (!horarioMarcado) {
            return res.status(404).json({ message: 'Horário não encontrado ou já está ocupado' });
        }

        res.json({ message: `Horário ${horario} marcado como ocupado com sucesso` });
    } catch (err) {
        console.error('Erro ao marcar horário como ocupado:', err);
        res.status(500).json({ message: 'Erro ao marcar horário como ocupado' });
    }
});

// Rota para desmarcar um horário
app.post('/desmarcar-horario', async (req: Request, res: Response) => {
    const { horario } = req.body;

    try {
        const horarioDesmarcado = await HorarioModel.findOneAndUpdate(
            { horario, disponivel: false }, // Procura pelo horário marcado como ocupado
            { disponivel: true }, // Marca como disponível novamente
            { new: true }
        );

        if (!horarioDesmarcado) {
            return res.status(404).json({ message: 'Horário não encontrado ou já está disponível' });
        }

        res.json({ message: `Horário ${horario} desmarcado com sucesso` });
    } catch (err) {
        console.error('Erro ao desmarcar horário:', err);
        res.status(500).json({ message: 'Erro ao desmarcar horário' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
