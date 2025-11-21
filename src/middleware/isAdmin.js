export const isAdmin = (req, res, next) => {
  const user = req.userLogged;
  if (!user || user.role !== 'ADMIN') {
    return res.status(403).json({ message: 'Acesso negado: admin necessário' });
  }
  next();
};
