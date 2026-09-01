import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface RecipeFeedback {
  id: string;
  recipe_id: string;
  feedback_type: "like" | "dislike";
  comment: string | null;
  created_at: string;
}

export function useFeedback() {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<Map<string, RecipeFeedback>>(new Map());
  const [loading, setLoading] = useState(true);

  // Load all feedback for the user
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const loadFeedback = async () => {
      try {
        const { data, error } = await supabase
          .from("recipe_feedback")
          .select("*")
          .eq("user_id", user.id);

        if (error) throw error;

        const map = new Map<string, RecipeFeedback>();
        if (data) {
          data.forEach((item: any) => {
            map.set(item.recipe_id, item);
          });
        }
        setFeedback(map);
      } catch (error) {
        console.error("Error loading feedback:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFeedback();
  }, [user]);

  const saveFeedback = useCallback(
    async (recipeId: string, type: "like" | "dislike", comment?: string) => {
      if (!user) return;

      try {
        const { error } = await supabase.from("recipe_feedback").upsert(
          {
            user_id: user.id,
            recipe_id: recipeId,
            feedback_type: type,
            comment: comment || null,
          },
          {
            onConflict: "user_id,recipe_id",
          }
        );

        if (error) throw error;

        // Update local state
        const newFeedback = new Map(feedback);
        newFeedback.set(recipeId, {
          id: Math.random().toString(),
          recipe_id: recipeId,
          feedback_type: type,
          comment: comment || null,
          created_at: new Date().toISOString(),
        });
        setFeedback(newFeedback);
      } catch (error) {
        console.error("Error saving feedback:", error);
      }
    },
    [user, feedback]
  );

  const getFeedback = useCallback(
    (recipeId: string) => {
      return feedback.get(recipeId);
    },
    [feedback]
  );

  const getLikedRecipes = useCallback(() => {
    return Array.from(feedback.values())
      .filter((f) => f.feedback_type === "like")
      .map((f) => f.recipe_id);
  }, [feedback]);

  const getDislikedRecipes = useCallback(() => {
    return Array.from(feedback.values())
      .filter((f) => f.feedback_type === "dislike")
      .map((f) => f.recipe_id);
  }, [feedback]);

  return {
    feedback,
    loading,
    saveFeedback,
    getFeedback,
    getLikedRecipes,
    getDislikedRecipes,
  };
}
