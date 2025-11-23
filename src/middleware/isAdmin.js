export const isAdmin = (req, res, next) => {
  // aceitar tanto `req.user` (novo padrão) quanto `req.userLogged` (retro-compatibilidade)
  const user = req.user || req.userLogged
  const role = user && user.role ? String(user.role).toUpperCase() : null

  if (!user || role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado: admin necessário', errorCode: 'ADMIN_REQUIRED' })
  }

  next()
}
