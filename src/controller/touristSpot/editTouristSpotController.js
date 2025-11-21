import { update } from "../../model/touristSpotModel.js";
import multer from 'multer';
import cloudinary from '../../utils/cloudinary.js';

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Accept optional file uploads (images) via multipart/form-data
export const editTouristSpotController = [
    upload.array('images', 10),
    async (req, res) => {
        try {
            const { id } = req.params;
            const numericId = Number(id);
            if (!Number.isInteger(numericId) || numericId <= 0) {
                return res.status(400).json({ error: 'ID inválido' });
            }

            // Start with body fields
            const body = { ...req.body };

            // If files were uploaded, upload them to Cloudinary and build images array of { url }
            let imagesNormalized = undefined;
            if (req.files && req.files.length > 0) {
                try {
                    const uploadPromises = req.files.map(file => new Promise((resolve, reject) => {
                        cloudinary.uploader.upload_stream({ folder: 'orlaz/touristSpots' }, (error, result) => {
                            if (error) return reject(error);
                            resolve({ url: result.secure_url });
                        }).end(file.buffer);
                    }));
                    imagesNormalized = await Promise.all(uploadPromises);
                } catch (uploadErr) {
                    return res.status(502).json({ error: 'Falha ao enviar imagens para o provedor de armazenamento.', details: uploadErr.message });
                }
            } else if (body.images) {
                // images may be JSON string or array
                try {
                    const imgs = typeof body.images === 'string' ? JSON.parse(body.images) : body.images;
                    if (Array.isArray(imgs)) {
                        imagesNormalized = imgs.map(i => {
                            if (typeof i === 'string') return { url: i };
                            if (i && i.url) return { url: i.url };
                            return null;
                        }).filter(Boolean);
                    }
                } catch (e) {
                    return res.status(400).json({ error: 'Campo images inválido.' });
                }
            }

            // Build update payload: include images array only if provided
            const payload = { ...body };
            if (imagesNormalized !== undefined) payload.images = imagesNormalized;

            const updated = await update(numericId, payload);
            return res.json({ mensagem: 'Ponto turístico atualizado com sucesso', touristSpot: updated });
        } catch (error) {
            console.error('editTouristSpotController error:', error);
            if (error && error.details) {
                return res.status(400).json({ error: 'Dados inválidos', details: error.details });
            }
            if (error && /existe/i.test(error.message)) {
                return res.status(409).json({ error: error.message });
            }
            if (error && error.code === 'P2002') {
                return res.status(409).json({ error: 'Conflito no banco: registro duplicado.' });
            }
            const payload = { error: error.message };
            if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
            return res.status(500).json(payload);
        }
    }
];