import jwt from 'jsonwebtoken'

export const authenticator = (req, res, next) => {
    const authHeader = req.headers['authorization']
    if (!authHeader) {
        return res.status(401).json({ message: 'Nâo autorizado' })
    }

    const token = authHeader.split(' ')[1] // Bearer <token>
    console.log('Auth Header:', authHeader);
    console.log('Token recebido:', token);

    if (!token) {
        return res.status(401).json({ message: 'Nâo autorizado' })
    }
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET)
        req.userLogged = payload // Em ajuste: armazenar em req.userLogged
    } catch (err) {
        console.error('Erro ao verificar o token:', err)
        return res.status(401).json({
            message: 'Token inválido',
            errorCode: 'INVALID_TOKEN'
        })
    }        
    next()
}