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

      let imageUrls = [];

      // Se for upload via form-data (arquivos)
      if (req.files && req.files.length > 0) {
        try {
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
          imageUrls = await Promise.all(uploadPromises);
        } catch (uploadErr) {
          return res.status(502).json({ error: 'Falha ao enviar imagens para o provedor de armazenamento.', details: uploadErr.message });
        }
      } else if (req.body.images) {
        // Se for JSON, use o array enviado (pode ser stringified)
        try {
          const imgs = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
          if (Array.isArray(imgs)) {
            // imgs can be array of strings or objects { url }
            imageUrls = imgs.map(i => {
              if (typeof i === 'string') return { url: i };
              if (i && i.url) return { url: i.url };
              return null;
            }).filter(Boolean);
          }
        } catch (e) {
          return res.status(400).json({ error: 'Campo images inválido.' });
        }
      }

      // Build payload and call model. Images are optional by business rules.
      const touristSpotData = { name, description, city, type };
      const created = await create(touristSpotData, imageUrls.length > 0 ? imageUrls : undefined);

      return res.status(201).json({ mensagem: 'Ponto turístico criado com sucesso', touristSpot: created });
    } catch (error) {
      // Validation errors thrown by model include `details`
      if (error && error.details) {
        return res.status(400).json({ error: 'Dados inválidos', details: error.details });
      }
      // Business conflict (unique)
      if (error && /existe/i.test(error.message)) {
        return res.status(409).json({ error: error.message });
      }
      // Prisma unique constraint
      if (error && error.code === 'P2002') {
        return res.status(409).json({ error: 'Conflito no banco: registro duplicado.' });
      }

      const payload = { error: error.message };
      if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
      return res.status(500).json(payload);
    }
  }
];
