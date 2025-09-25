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

      // Cria restaurante com as URLs das imagens
      const restaurantData = {
        name,
        description,
        address,
        city,
        ...(phone && { phone }),
        ...(website && { website }),
        images // [{ url: ... }, ...]
      };
      const data = await create(restaurantData);
      res.status(201).json({
        mensagem: 'Restaurante criado com sucesso',
        restaurant: data
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];
