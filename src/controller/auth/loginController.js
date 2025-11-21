import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { getByEmail } from '../../model/profileModel.js'

export const loginController = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await getByEmail(email);
        if (!user) {
            console.error('Usuário não encontrado para o email:', email);
            return res.status(401).json({ message: 'Email ou Senha Inválida' });
        }

        const passOk = await bcrypt.compare(password, user.password);
        if (!passOk) {
            console.error('Senha inválida para o usuario:', email);
            return res.status(401).json({ message: 'Email ou Senha Inválida' });
        }

        const payload = { id: user.id, email: user.email, role: user.role || 'USER' };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        return res.status(200).json({
            profile: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role || 'USER',
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