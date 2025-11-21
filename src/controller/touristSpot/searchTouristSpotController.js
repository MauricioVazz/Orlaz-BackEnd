import { search } from "../../model/touristSpotModel.js";

export const searchTouristSpotController = async (req, res) => {
  try {
    // query params: q (or name), city, type, page, limit
    const { q, name, city, type, page, limit } = req.query;
    const options = {};
    if (q) options.q = String(q).trim();
    if (name) options.name = String(name).trim();
    if (city) options.city = String(city).trim();
    if (type) options.type = String(type).trim();
    if (page) options.page = Number(page);
    if (limit) options.limit = Number(limit);

    const result = await search(options);
    res.json({ message: 'Busca realizada com sucesso', total: result.total, page: options.page || 1, limit: options.limit || 20, items: result.items });
  } catch (error) {
    console.error('searchTouristSpotController error:', error);
    const payload = { error: 'Erro ao buscar pontos turísticos' };
    if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
    res.status(500).json(payload);
  }
};
