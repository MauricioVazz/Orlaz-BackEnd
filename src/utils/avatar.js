// Função para gerar uma cor aleatória de uma lista pré-definida
function getRandomAvatarColor() {
  const colors = [
    '#F44336', // vermelho
    '#E91E63', // rosa
    '#9C27B0', // roxo
    '#3F51B5', // azul
    '#03A9F4', // azul claro
    '#009688', // teal
    '#4CAF50', // verde
    '#FF9800', // laranja
    '#795548', // marrom
    '#607D8B'  // cinza
  ];
  const index = Math.floor(Math.random() * colors.length);
  return colors[index];
}

// Exemplo de uso no cadastro de usuário
async function createUser({ name, email, password, prisma }) {
  const avatarColor = getRandomAvatarColor();
  // avatarUrl começa vazio
  return await prisma.user.create({
    data: {
      name,
      email,
      password,
      avatarColor,
      avatarUrl: null
    }
  });
}

export { getRandomAvatarColor, createUser };