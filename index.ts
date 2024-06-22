import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

const app = express();
const PORT = 3333;

app.use(bodyParser.json());

mongoose.connect('mongodb://localhost:27017/minha_base_de_dados');

// Esquema do usuário
const UserSchema = new mongoose.Schema({
    login: String,
    senha: String,
});
const UserModel = mongoose.model('User', UserSchema);

// Esquema do horário
const HorarioSchema = new mongoose.Schema({
    horario: String,
    disponivel: Boolean,
});
const HorarioModel = mongoose.model('Horario', HorarioSchema);

// Esquema do agendamento
const AgendamentoSchema = new mongoose.Schema({
    horario: { type: mongoose.Schema.Types.ObjectId, ref: 'Horario' },
    horarioTexto: String, // Campo adicional para armazenar o texto do horário
    data: String,
    servico: String,
    valor: Number,
    minuto: Number,
});
const AgendamentoModel = mongoose.model('Agendamento', AgendamentoSchema);

// Rota de login
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

// Rotas de horários
app.get('/horarios-disponiveis', async (req: Request, res: Response) => {
    try {
        const horariosDisponiveis = await HorarioModel.find({ disponivel: true });
        res.json(horariosDisponiveis);
    } catch (err) {
        console.error('Erro ao buscar horários disponíveis:', err);
        res.status(500).json({ message: 'Erro ao buscar horários disponíveis' });
    }
});

app.get('/horarios-indisponiveis', async (req: Request, res: Response) => {
    try {
        const horariosIndisponiveis = await HorarioModel.find({ disponivel: false });
        res.json(horariosIndisponiveis);
    } catch (err) {
        console.error('Erro ao buscar horários indisponíveis:', err);
        res.status(500).json({ message: 'Erro ao buscar horários indisponíveis' });
    }
});

// Rota para marcar um horário como ocupado e criar um agendamento
app.post('/marcar-horario', async (req: Request, res: Response) => {
    const { horario, data, servico, valor, minuto } = req.body;

    try {
        const horarioMarcado = await HorarioModel.findOneAndUpdate(
            { horario, disponivel: true },
            { disponivel: false },
            { new: true }
        );

        if (!horarioMarcado) {
            return res.status(404).json({ message: 'Horário não encontrado ou já está ocupado' });
        }

        const agendamento = new AgendamentoModel({
            horario: horarioMarcado._id,
            horarioTexto: horario, // Adiciona o horário em formato de texto
            data,
            servico,
            valor,
            minuto,
        });

        await agendamento.save();

        res.json({
            message: `Horário ${horario} marcado como ocupado com sucesso`,
            agendamento,
        });
    } catch (err) {
        console.error('Erro ao marcar horário como ocupado:', err);
        res.status(500).json({ message: 'Erro ao marcar horário como ocupado' });
    }
});

// Rota para desmarcar um horário e remover o agendamento correspondente
app.post('/desmarcar-horario', async (req: Request, res: Response) => {
    const { horario } = req.body;

    try {
        const horarioDesmarcado = await HorarioModel.findOneAndUpdate(
            { horario, disponivel: false },
            { disponivel: true },
            { new: true }
        );

        if (!horarioDesmarcado) {
            return res.status(404).json({ message: 'Horário não encontrado ou já está disponível' });
        }

        await AgendamentoModel.findOneAndDelete({ horario: horarioDesmarcado._id });

        res.json({ message: `Horário ${horario} desmarcado com sucesso` });
    } catch (err) {
        console.error('Erro ao desmarcar horário:', err);
        res.status(500).json({ message: 'Erro ao desmarcar horário' });
    }
});

// Rota para obter todos os agendamentos
app.get('/agendamentos', async (req: Request, res: Response) => {
    try {
        const agendamentos = await AgendamentoModel.find().populate('horario');
        res.json(agendamentos);
    } catch (err) {
        console.error('Erro ao buscar agendamentos:', err);
        res.status(500).json({ message: 'Erro ao buscar agendamentos' });
    }
});

// Rota para desagendar um agendamento
app.post('/desagendar', async (req: Request, res: Response) => {
    const { horario, data } = req.body;

    try {
        const agendamentoRemovido = await AgendamentoModel.findOneAndDelete({ horario, data });

        if (!agendamentoRemovido) {
            return res.status(404).json({ message: 'Agendamento não encontrado' });
        }

        await HorarioModel.findByIdAndUpdate(agendamentoRemovido.horario, { disponivel: true });

        res.json({ message: `Agendamento para ${horario} na data ${data} removido com sucesso` });
    } catch (err) {
        console.error('Erro ao desagendar:', err);
        res.status(500).json({ message: 'Erro ao desagendar' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
