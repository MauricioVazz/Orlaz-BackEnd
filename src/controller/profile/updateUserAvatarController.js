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
      const nid = +req.params.id;

      // Validate id
      if (!req.params.id || isNaN(nid) || !Number.isInteger(nid) || nid <= 0) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const user = await getById(nid);
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      // Upload para o Cloudinary (promisified)
      const uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder: 'orlaz/avatars' }, (error, result) => {
          if (error) return reject(error);
          resolve(result);
        });
        stream.end(req.file.buffer);
      });

      // Atualiza o usuário com a nova URL do avatar e updatedAt
      const updated = await update(nid, { avatarUrl: uploadResult.secure_url, updatedAt: new Date() });
      return res.status(200).json({ mensagem: 'Avatar atualizado com sucesso', user: updated });
    } catch (error) {
      console.error('updateUserAvatarController error:', error);
      if (error && error.message === 'Validation failed' && error.details) {
        return res.status(400).json({ errors: error.details });
      }
      return res.status(500).json({ error: 'Erro ao atualizar avatar' });
    }
  }
];
