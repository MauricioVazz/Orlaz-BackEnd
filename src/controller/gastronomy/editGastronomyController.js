import { update } from '../../model/gastronomyModel.js';
import cloudinary from '../../utils/cloudinary.js';

export const editGastronomyController = async (req, res) => {
    try {
        const id = +req.params.id;
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const gastronomy = req.body;
        // If a file was uploaded in multipart/form-data, upload it to Cloudinary
        if (req.files && req.files.length > 0) {
            // take the first file
            const file = req.files[0];
            try {
                const uploaded = await new Promise((resolve, reject) => {
                    cloudinary.uploader.upload_stream({ folder: 'orlaz/gastronomy' }, (error, result) => {
                        if (error) return reject(error);
                        resolve(result);
                    }).end(file.buffer);
                });
                gastronomy.imageUrl = uploaded.secure_url;
            } catch (uploadErr) {
                console.error('Erro ao fazer upload da imagem no editGastronomyController:', uploadErr);
                return res.status(502).json({ error: 'Falha ao fazer upload da imagem.' });
            }
        }
        if (!gastronomy || Object.keys(gastronomy).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio.' });
        }

        // Normalizar campos enviados
        if (gastronomy.name) gastronomy.name = String(gastronomy.name).trim();
        if (gastronomy.description) gastronomy.description = String(gastronomy.description).trim();
        if (gastronomy.city) gastronomy.city = String(gastronomy.city).trim();

        const result = await update(id, gastronomy);
        return res.json({
            message: 'Gastronomia atualizada com sucesso',
            gastronomy: result
        });
    } catch (error) {
        // Zod / validation errors include `details`
        if (error && error.details) {
            return res.status(400).json({ error: error.message || 'Dados inválidos', details: error.details });
        }

        // Not found
        if (error && typeof error.message === 'string' && error.message.toLowerCase().includes('não encontrada')) {
            return res.status(404).json({ error: error.message });
        }

        // Conflict / duplicate
        if (error && typeof error.message === 'string' && (error.message.includes('Já existe') || error.message.includes('Conflito'))) {
            return res.status(409).json({ error: error.message });
        }

        console.error('Erro em editGastronomyController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao atualizar gastronomia' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};
