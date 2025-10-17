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
      let { name, description, city } = req.body;
      // Limpar espaços extras dos campos de texto
      name = name ? name.trim() : undefined;
      description = description ? description.trim() : undefined;
      city = city ? city.trim() : undefined;
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

      const images = await Promise.all(uploadPromises);

      // Cria gastronomia com as URLs das imagens
      // Some Prisma schemas require a top-level imageUrl field (thumbnail/main image).
      // Use the first uploaded image as the main imageUrl to satisfy the schema.
      const gastronomyData = {
        name,
        description,
        city,
        images, // [{ url: ... }, ...]
        imageUrl: images && images.length > 0 ? images[0].url : undefined
      };

      // Debugging aid: log payload if running locally so it's easy to see what's being sent to Prisma
      if (process.env.NODE_ENV !== 'production') {
        console.log('createGastronomyWithImagesController - gastronomyData:', gastronomyData);
      }

      if (!gastronomyData.imageUrl) {
        return res.status(400).json({ error: 'imageUrl ausente após upload — verifique Cloudinary ou o processamento das imagens' });
      }

      const data = await create(gastronomyData);
      res.status(201).json({
        mensagem: 'Gastronomia criada com sucesso',
        gastronomy: data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
