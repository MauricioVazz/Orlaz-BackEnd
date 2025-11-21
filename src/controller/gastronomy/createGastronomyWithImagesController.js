import cloudinary from '../../utils/cloudinary.js';
import multer from 'multer';
import { create } from '../../model/gastronomyModel.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controller para criar gastronomia com múltiplas imagens
export const createGastronomyWithImagesController = [
  upload.array('images', 10), // até 10 imagens
  async (req, res) => {
    try {
      let { name, description, city } = req.body || {};
      // Limpar espaços extras dos campos de texto
      name = name ? String(name).trim() : undefined;
      description = description ? String(description).trim() : undefined;
      city = city ? String(city).trim() : undefined;

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      // Upload de todas as imagens para o Cloudinary
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'orlaz/gastronomy' },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url });
            }
          ).end(file.buffer);
        });
      });

      let images;
      try {
        images = await Promise.all(uploadPromises);
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(502).json({ error: 'Falha ao fazer upload das imagens.' });
      }

      // Use apenas a primeira imagem como imageUrl (o schema de Gastronomy só armazena imageUrl)
      const imageUrl = images && images.length > 0 ? images[0].url : undefined;

      const gastronomyData = {
        name,
        description,
        city,
        imageUrl
      };

      // Debug: mostrar payload em ambiente de desenvolvimento
      if (process.env.NODE_ENV !== 'production') {
        console.log('createGastronomyWithImagesController - gastronomyData:', gastronomyData);
      }

      if (!gastronomyData.imageUrl) {
        return res.status(400).json({ error: 'imageUrl ausente após upload — verifique Cloudinary ou o processamento das imagens' });
      }

      const data = await create(gastronomyData);
      return res.status(201).json({
        mensagem: 'Gastronomia criada com sucesso',
        gastronomy: data
      });
    } catch (error) {
      // Erros de validação do model incluem `details`
      if (error && error.details) {
        return res.status(400).json({ error: error.message || 'Dados inválidos', details: error.details });
      }

      // Conflitos/duplicidade
      if (error && typeof error.message === 'string' && (error.message.includes('Já existe') || error.message.includes('Conflito'))) {
        return res.status(409).json({ error: error.message });
      }

      console.error('Erro em createGastronomyWithImagesController:', error);
      const isProd = process.env.NODE_ENV === 'production';
      return res.status(500).json({ error: isProd ? 'Erro ao criar gastronomia' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
  }
];
