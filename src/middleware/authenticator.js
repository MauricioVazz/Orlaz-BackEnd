import jwt from 'jsonwebtoken'

export const authenticator = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization']
    if (!authHeader || typeof authHeader !== 'string') {
        return res.status(401).json({ message: 'Não autorizado' })
    }

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || !/^Bearer$/i.test(parts[0])) {
        return res.status(401).json({ message: 'Formato do cabeçalho Authorization inválido' })
    }

    const token = parts[1]
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado' })
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET não está definido no ambiente')
        return res.status(500).json({ message: 'Server configuration error' })
    }

    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] })
        // definir `req.user` como padrão e manter `req.userLogged` por retro-compatibilidade
        req.user = payload
        req.userLogged = payload
    } catch (err) {
        console.error('Erro ao verificar o token:', err?.name ?? err)
        return res.status(401).json({
            message: 'Token inválido',
            errorCode: 'INVALID_TOKEN'
        })
    }

    next()
}