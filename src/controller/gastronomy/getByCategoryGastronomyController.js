import { getByCategory } from '../../model/gastronomyModel.js';

export const getByCategoryGastronomyController = async (req, res) => {
  try {
    const { city } = req.params;
    const result = await getByCategory(city);
    res.json({
      message: 'Gastronomias encontradas por cidade',
      gastronomies: result
    });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar gastronomias por cidade' });
  }
};
