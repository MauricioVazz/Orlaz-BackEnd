import express from 'express';
import cors from 'cors';
import profileRouter from './routers/profileRouter.js';
import touristSpotRouter from './routers/touristSpotRouter.js';
import favoriteRouter from './routers/favoriteRouter.js';

const app = express();
const port = 3000;

app.use(express.json()); // Middleware para converter JSOn
app.use(cors());

app.use('/profile', profileRouter);
app.use('/tourist-spot', touristSpotRouter);
app.use('/favorite', favoriteRouter);

app.listen(port, () => {
    console.log(`Server rodando na porta ${port}`);
})