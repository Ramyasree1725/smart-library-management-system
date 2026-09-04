import { dbStore } from '../data/store.js';
import { generateRecommendations } from '../utils/recommender.js';

export const getRecommendations = (req, res) => {
  try {
    const studentId = req.user._id;
    const recommendations = generateRecommendations(studentId, dbStore.books, dbStore.transactions);

    return res.json({
      success: true,
      count: recommendations.length,
      recommendations
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to generate recommendations', error: error.message });
  }
};
