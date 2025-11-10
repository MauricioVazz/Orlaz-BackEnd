import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getByEmail } from '../../model/profileModel.js'

export const loginController = async (req, res) => {
    try {
        // receber o email e a senha do corpo da requisição
        const { email, password } = req.body;

        // comparar se o email e a senha estão corretos com o banco
        const user = await getByEmail(email);
        if (!user) {
            console.error('Usuário não encontrado para o email:', email);
            return res.status(401).json({ message: 'Email ou Senha Inválida' });
        }

        // Comparacao de senha por bcrypt
        // const passOk = await bcrypt.compare(password, user.password);
        // Teste temporário: comparação direta (texto puro)
        const passOk = password === user.password;
        if (!passOk) {
            console.error('Senha inválida para o usuario:', email);
            return res.status(401).json({ message: 'Email ou Senha Inválida' });
        }

        // se estiverem corretos, gerar um token (JWT)
        const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1d' });

        if (!token) {
            return res.status(500).json({ message: 'Erro ao gerar o token de acesso' });
        }

        // enviar o token como resposta para o cliente
        return res.status(200).json({
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                avatarUrl: user.avatarUrl || null,
                avatarColor: user.avatarColor || null
            },
            token
        });
    } catch (error) {
        console.error('loginController error:', error);
        return res.status(500).json({ message: 'Erro interno ao processar login' });
    }
}