import { create } from "../../model/touristSpotModel.js";

export const createTouristSpotController = async (req, res) => {
    try {
        const { name, description, city, type, canFavorite, images } = req.body;
        // Monta o objeto no formato esperado pelo model
        const touristSpot = {
            name,
            description,
            city,
            type,
            canFavorite: canFavorite ?? true
        };
        // images deve ser um array de URLs
        const data = await create(touristSpot, images);
        res.status(201).json({
            mensagem: "Ponto turístico criado com sucesso",
            touristSpot: data
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar ponto turístico" });
    }
};
