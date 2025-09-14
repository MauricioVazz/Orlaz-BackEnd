import express from 'express';
import cors from 'cors';
import profileRouter from './routers/profileRouter.js';

const app = express();
const port = 3000;

app.use(express.json()); // Middleware para converter JSOn

app.use('/profile', profileRouter);
app.use(cors());

app.listen(port, () => {
    console.log(`Server rodando na porta ${port}`);
})