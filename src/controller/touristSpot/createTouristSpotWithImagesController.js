import cloudinary from '../../utils/cloudinary.js';
import multer from 'multer';
import { create } from '../../model/touristSpotModel.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controller para criar ponto turístico com múltiplas imagens
export const createTouristSpotWithImagesController = [
  upload.array('images', 10), // até 10 imagens
  async (req, res) => {
    try {
      let { name, description, city, type } = req.body;
      name = name ? name.trim() : undefined;
      description = description ? description.trim() : undefined;
      city = city ? city.trim() : undefined;
      type = type ? type.trim() : undefined;

      let images = [];
      // Se for upload via form-data (arquivos)
      if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(file => {
          return new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              { folder: 'orlaz/touristSpots' },
              (error, result) => {
                if (error) reject(error);
                else resolve({ url: result.secure_url });
              }
            ).end(file.buffer);
          });
        });
        images = await Promise.all(uploadPromises);
      } else if (req.body.images) {
        // Se for JSON, use o array enviado
        try {
          images = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
        } catch (e) {
          return res.status(400).json({ error: 'Campo images inválido.' });
        }
        if (!Array.isArray(images)) images = [];
      }

      if (!images || images.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      // O model espera: create(touristSpot, images)
      const touristSpotData = {
        name,
        description,
        city,
        type
      };
      // O array images deve ser só de urls (string), não objetos
      const imageUrls = images.map(img => img.url || img);
      const data = await create(touristSpotData, imageUrls);
      res.status(201).json({
        mensagem: 'Ponto turístico criado com sucesso',
        touristSpot: data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
