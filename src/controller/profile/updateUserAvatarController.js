import cloudinary from '../../utils/cloudinary.js';
import multer from 'multer';
import { update, getById } from '../../model/profileModel.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controller para atualizar o avatar do usuário
export const updateUserAvatarController = [
  upload.single('avatar'), // campo deve ser 'avatar' no form-data
  async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const user = await getById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }
      // Upload para o Cloudinary
      cloudinary.uploader.upload_stream(
        { folder: 'orlaz/avatars' },
        async (error, result) => {
          if (error) {
            return res.status(500).json({ error: 'Erro ao fazer upload do avatar.' });
          }
          // Atualiza o usuário com a nova URL do avatar
          const updated = await update(userId, { avatarUrl: result.secure_url });
          res.status(200).json({ mensagem: 'Avatar atualizado com sucesso', user: updated });
        }
      ).end(req.file.buffer);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
