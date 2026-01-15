"use client";

import { useCallback } from "react";
import { useFavoritesStore } from "@/store/useFavoritesStore";

export function FavoriteButton({ source, id, videoDetail }) {
  const isFavorited = useFavoritesStore((state) => state.isFavorited);
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  // 直接从 store 派生收藏状态，无需本地 state 和 useEffect
  const favoriteState =
    videoDetail && id && source ? isFavorited(source, id) : false;

  // 处理收藏
  const handleToggleFavorite = useCallback(() => {
    if (!videoDetail || !id || !source) return;

    toggleFavorite({
      source,
      id,
      title: videoDetail.title,
      type: videoDetail.episodes?.length > 1 ? "tv" : "movie",
      genre: videoDetail.genre || "",
      poster: videoDetail.poster,
    });
  }, [videoDetail, id, source, toggleFavorite]);

  return (
    <button
      onClick={handleToggleFavorite}
      className={`flex items-center justify-center h-10 w-10 rounded-full hover:bg-gray-100 transition-colors ${
        favoriteState
          ? "text-red-500 hover:text-red-600"
          : "text-gray-400 hover:text-red-500"
      }`}
      title={favoriteState ? "取消收藏" : "添加收藏"}
    >
      <span
        className={`material-symbols-outlined ${
          favoriteState ? "material-symbols-filled" : ""
        }`}
      >
        favorite
      </span>
    </button>
  );
}
