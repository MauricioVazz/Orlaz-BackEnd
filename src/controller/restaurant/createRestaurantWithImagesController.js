import cloudinary from '../../utils/cloudinary.js';
import multer from 'multer';
import { create } from '../../model/restaurantModel.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Controller para criar restaurante com múltiplas imagens
export const createRestaurantWithImagesController = [
  upload.array('images', 10), // até 10 imagens
  async (req, res) => {
    try {
  let { name, description, address, phone, website, city } = req.body;
  // Limpar espaços extras dos campos de texto
  name = name ? name.trim() : undefined;
  description = description ? description.trim() : undefined;
  address = address ? address.trim() : undefined;
  phone = phone ? phone.trim() : undefined;
  website = website ? website.trim() : undefined;
  city = city ? city.trim() : undefined;
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      // Upload de todas as imagens para o Cloudinary
      const uploadPromises = req.files.map(file => {
        return new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { folder: 'orlaz/restaurants' },
            (error, result) => {
              if (error) reject(error);
              else resolve({ url: result.secure_url });
            }
          ).end(file.buffer);
        });
      });

      const images = await Promise.all(uploadPromises);

      // Prepare payload for model (only allowed fields)
      const restaurantData = {
        name,
        description,
        address,
        city,
        ...(phone && { phone }),
        ...(website && { website }),
        images // [{ url: ... }, ...]
      };

      try {
        const data = await create(restaurantData);
        return res.status(201).json({ mensagem: 'Restaurante criado com sucesso', restaurant: data });
      } catch (error) {
        // Validation errors from model include `details`
        if (error && error.details) {
          return res.status(400).json({ error: error.message || 'Dados inválidos', details: error.details });
        }

        // Conflict / duplicate
        if (error && typeof error.message === 'string' && (error.message.includes('Já existe') || error.message.includes('Conflito'))) {
          return res.status(409).json({ error: error.message });
        }

        console.error('Erro em createRestaurantWithImagesController (create):', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao criar restaurante' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
      }
    } catch (error) {
      // Upload errors are caught earlier, but handle unexpected errors here
      console.error('Erro em createRestaurantWithImagesController:', error);
      const isProd = process.env.NODE_ENV === 'production';
      return res.status(500).json({ error: isProd ? 'Erro ao criar restaurante' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
  }
];
