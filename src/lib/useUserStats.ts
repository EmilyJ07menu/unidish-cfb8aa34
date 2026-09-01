import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface SharedRecipe {
  id: string;
  recipe_id: string;
  title: string;
  image: string | null;
  price: number | null;
  minutes: number | null;
  serves: number | null;
  description: string | null;
  created_at: string;
}

export interface UserStats {
  friendCount: number;
  sharedRecipeCount: number;
  sharedRecipes: SharedRecipe[];
  isFollowing: boolean;
}

export function useUserStats(userId: string) {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Get current user ID
  useEffect(() => {
    supabase.auth.getUser().then((data) => {
      setCurrentUserId(data.data.user?.id ?? null);
    });
  }, []);

  // Load user stats
  useEffect(() => {
    if (!userId) return;

    const loadStats = async () => {
      try {
        // Get friend count
        const { data: friendships, error: friendError } = await supabase
          .from("friendships")
          .select("id")
          .eq("following_id", userId);

        if (friendError) throw friendError;
        const friendCount = friendships?.length ?? 0;

        // Get shared recipes
        const { data: recipes, error: recipeError } = await supabase
          .from("shared_recipes")
          .select("*")
          .eq("user_id", userId)
          .order("created_at", { ascending: false });

        if (recipeError) throw recipeError;
        const sharedRecipes = (recipes as SharedRecipe[]) ?? [];

        // Check if current user is following
        let isFollowing = false;
        if (currentUserId && currentUserId !== userId) {
          const { data: friendship } = await supabase
            .from("friendships")
            .select("id")
            .eq("follower_id", currentUserId)
            .eq("following_id", userId)
            .maybeSingle();

          isFollowing = !!friendship;
        }

        setStats({
          friendCount,
          sharedRecipeCount: sharedRecipes.length,
          sharedRecipes,
          isFollowing,
        });
      } catch (error) {
        console.error("Error loading user stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [userId, currentUserId]);

  const toggleFollow = useCallback(
    async (follow: boolean) => {
      if (!currentUserId || !userId) return;

      try {
        if (follow) {
          // Add friendship
          const { error } = await supabase.from("friendships").insert({
            follower_id: currentUserId,
            following_id: userId,
          });

          if (error) throw error;
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  isFollowing: true,
                  friendCount: prev.friendCount + 1,
                }
              : null
          );
        } else {
          // Remove friendship
          const { error } = await supabase
            .from("friendships")
            .delete()
            .eq("follower_id", currentUserId)
            .eq("following_id", userId);

          if (error) throw error;
          setStats((prev) =>
            prev
              ? {
                  ...prev,
                  isFollowing: false,
                  friendCount: prev.friendCount - 1,
                }
              : null
          );
        }
      } catch (error) {
        console.error("Error toggling follow:", error);
      }
    },
    [currentUserId, userId]
  );

  return { stats, loading, toggleFollow, currentUserId };
}

export function useAddSharedRecipe() {
  const addRecipe = useCallback(
    async (userId: string, recipe: SharedRecipe) => {
      try {
        const { error } = await supabase.from("shared_recipes").upsert({
          user_id: userId,
          recipe_id: recipe.recipe_id,
          title: recipe.title,
          image: recipe.image,
          price: recipe.price,
          minutes: recipe.minutes,
          serves: recipe.serves,
          description: recipe.description,
        });

        if (error) throw error;
      } catch (error) {
        console.error("Error adding shared recipe:", error);
        throw error;
      }
    },
    []
  );

  return { addRecipe };
}
