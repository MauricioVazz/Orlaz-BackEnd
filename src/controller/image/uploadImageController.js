import cloudinary from '../../utils/cloudinary.js';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImageController = [
  upload.single('image'),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
      }

      // Upload para o Cloudinary usando stream
      cloudinary.uploader.upload_stream(
        { folder: 'orlaz' },
        (error, result) => {
          if (error) return res.status(500).json({ error: error.message });
          res.status(201).json({ url: result.secure_url });
        }
      ).end(req.file.buffer);

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
];