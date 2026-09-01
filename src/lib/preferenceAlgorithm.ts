import type { RecipeFeedback } from "./useFeedback";

export interface RecipeData {
  id: string;
  title: string;
  tags: string[];
  price: number;
  minutes: number;
  serves: number;
  [key: string]: any;
}

/**
 * Sorts recipes based on user feedback history
 * Learns from likes/dislikes to surface better recommendations
 */
export function sortRecipesByPreferences(
  recipes: RecipeData[],
  feedbackMap: Map<string, RecipeFeedback>
): RecipeData[] {
  if (feedbackMap.size === 0) {
    // No feedback yet, return as-is
    return recipes;
  }

  // Collect all liked and disliked tags/properties
  const likedTags = new Set<string>();
  const dislikedTags = new Set<string>();
  const likedPriceRange = { min: Infinity, max: 0 };
  const dislikedPriceRange = { min: Infinity, max: 0 };

  feedbackMap.forEach((feedback) => {
    const recipe = recipes.find((r) => r.id === feedback.recipe_id);
    if (!recipe) return;

    if (feedback.feedback_type === "like") {
      recipe.tags?.forEach((tag) => likedTags.add(tag));
      likedPriceRange.min = Math.min(likedPriceRange.min, recipe.price);
      likedPriceRange.max = Math.max(likedPriceRange.max, recipe.price);
    } else {
      recipe.tags?.forEach((tag) => dislikedTags.add(tag));
      dislikedPriceRange.min = Math.min(dislikedPriceRange.min, recipe.price);
      dislikedPriceRange.max = Math.max(dislikedPriceRange.max, recipe.price);
    }
  });

  // Score each recipe
  return [...recipes].sort((a, b) => {
    let scoreA = 0;
    let scoreB = 0;

    // Tag matching (most important)
    const aTagMatch = (a.tags || []).filter((tag) => likedTags.has(tag)).length;
    const bTagMatch = (b.tags || []).filter((tag) => likedTags.has(tag)).length;
    scoreA += aTagMatch * 10;
    scoreB += bTagMatch * 10;

    // Tag avoidance
    const aTagDislike = (a.tags || []).filter((tag) => dislikedTags.has(tag)).length;
    const bTagDislike = (b.tags || []).filter((tag) => dislikedTags.has(tag)).length;
    scoreA -= aTagDislike * 15;
    scoreB -= bTagDislike * 15;

    // Price preference (if user has shown preference)
    if (likedPriceRange.max > 0) {
      const likedAvg = (likedPriceRange.min + likedPriceRange.max) / 2;
      const aPriceDiff = Math.abs(a.price - likedAvg);
      const bPriceDiff = Math.abs(b.price - likedAvg);
      scoreA -= aPriceDiff * 2;
      scoreB -= bPriceDiff * 2;
    }

    // Avoid disliked price range
    if (dislikedPriceRange.max > 0) {
      const dislikedAvg = (dislikedPriceRange.min + dislikedPriceRange.max) / 2;
      const aPriceDiff = Math.abs(a.price - dislikedAvg);
      const bPriceDiff = Math.abs(b.price - dislikedAvg);
      if (aPriceDiff < 5) scoreA -= 5;
      if (bPriceDiff < 5) scoreB -= 5;
    }

    // Cook time - prefer closer to liked average if available
    const likedRecipes = Array.from(recipes.values() || []).filter((r) => {
      const fb = feedbackMap.get(r.id || "");
      return fb?.feedback_type === "like";
    });
    if (likedRecipes.length > 0) {
      const avgMinutes =
        likedRecipes.reduce((sum, r) => sum + (r.minutes || 0), 0) / likedRecipes.length;
      const aMinutesDiff = Math.abs((a.minutes || 0) - avgMinutes);
      const bMinutesDiff = Math.abs((b.minutes || 0) - avgMinutes);
      scoreA -= aMinutesDiff * 0.5;
      scoreB -= bMinutesDiff * 0.5;
    }

    return scoreB - scoreA;
  });
}

/**
 * Filters out recipes the user has already seen
 */
export function filterSeenRecipes(recipes: RecipeData[], seenIds: Set<string>): RecipeData[] {
  return recipes.filter((recipe) => !seenIds.has(recipe.id));
}
