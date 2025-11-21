import { getByCategory } from '../../model/gastronomyModel.js';

export const getByCategoryGastronomyController = async (req, res) => {
  try {
    let { city } = req.params;
    if (!city) return res.status(400).json({ error: 'Cidade obrigatória.' });

    city = String(city).trim().toUpperCase();

    const result = await getByCategory(city);
    return res.json({
      message: 'Gastronomias encontradas por cidade',
      gastronomies: result
    });
  } catch (error) {
    // Validation errors from model
    if (error && error.message && error.message.toLowerCase().includes('cidade inválida')) {
      return res.status(400).json({ error: error.message });
    }

    console.error('Erro em getByCategoryGastronomyController:', error);
    const isProd = process.env.NODE_ENV === 'production';
    return res.status(500).json({ error: isProd ? 'Erro ao buscar gastronomias por cidade' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
  }
};
