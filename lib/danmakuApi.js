/**
 * 弹幕相关API函数
 */

/**
 * 位置映射：将API返回的位置转换为插件需要的模式
 * right -> 0 (滚动)
 * top -> 1 (顶部)
 * bottom -> 2 (底部)
 */

import { extractEpisodeNumberFromTitle } from "@/lib/util";

const POSITION_MAP = {
  right: 0,
  top: 1,
  bottom: 2,
};

/**
 * 转换弹幕数据格式
 * 从API格式转换为插件格式
 * @param {Array} rawDanmaku - API返回的弹幕数组 [[时间, 位置, 颜色, 文字大小, 弹幕内容], ...]
 * @returns {Array} 插件格式的弹幕数组 [{ text, time, color, mode }, ...]
 */
function convertDanmakuFormat(rawDanmaku) {
  if (!Array.isArray(rawDanmaku)) {
    return [];
  }

  return rawDanmaku
    .map((item) => {
      if (!Array.isArray(item) || item.length < 5) {
        return null;
      }

      const [time, position, color, fontSize, text] = item;

      return {
        text: String(text || ""),
        time: Number(time) || 0,
        mode: POSITION_MAP[position] || 0,
        color: color || "#ffffff",
        border: false,
        fontSize: parseInt(fontSize) || 25,
      };
    })
    .filter(Boolean);
}

export function createDanmakuLoader(
  danmakuSources,
  doubanId,
  episodeTitle,
  episodeIndex,
  isMovie,
) {
  const enabledSources = danmakuSources.filter((source) => source.enabled);
  if (!doubanId || !episodeTitle || enabledSources.length === 0) {
    console.log("缺少必要的参数：豆瓣ID 或 集数 或 没有启用的弹幕源");
    return () => {
      return new Promise((resolve) => {
        resolve([]);
      });
    };
  }
  let episodeNumber = extractEpisodeNumberFromTitle(episodeTitle, isMovie);
  if (episodeNumber === null) {
    episodeNumber = episodeIndex + 1;
    console.warn(
      `无法从标题 "${episodeTitle}" 中提取集数，使用索引 ${episodeNumber}`,
    );
  }
  const finalDanmuUrl = `${enabledSources[0].url}/api/v2/douban?douban_id=${doubanId}&episode_number=${episodeNumber}`;
  console.log("获取弹幕URL:", finalDanmuUrl);
  return () => {
    return new Promise((resolve, reject) => {
      fetch(finalDanmuUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const convertedData = convertDanmakuFormat(data.danmuku || []);
          console.log(`成功获取 ${convertedData.length} 条弹幕`);
          resolve(convertedData);
        })
        .catch((error) => {
          console.error("获取弹幕失败:", error);
          console.log("获取弹幕失败:", data);
          resolve([]);
        });
    });
  };
}

export async function searchAnime(baseUrl, animeName) {
  const apiUrl = `${baseUrl}/api/v2/search/anime?keyword=${encodeURIComponent(animeName)}`;
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 10秒超时
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      keepalive: true,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("搜索动漫失败:", error);
  }
}

export async function getEpisodes(baseUrl, animeId) {
  const apiUrl = `${baseUrl}/api/v2/bangumi/${animeId}`;
  // 添加超时控制
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // 10秒超时
  try {
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      keepalive: true,
    });
    clearTimeout(timeoutId);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error("获取动漫集数失败:", error);
  }
}


export function createDanmakuLoaderDirect(
  danmakuSources,
  episodeId
) {
  const enabledSources = danmakuSources.filter((source) => source.enabled);
  const finalDanmuUrl = `${enabledSources[0].url}/api/v2/comment/${episodeId}`;
  console.log("获取弹幕URL:", finalDanmuUrl);
  return () => {
    return new Promise((resolve, reject) => {
      fetch(finalDanmuUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          const convertedData = convertDanmakuFormat(data.danmuku || []);
          console.log(`成功获取 ${convertedData.length} 条弹幕`);
          resolve(convertedData);
        })
        .catch((error) => {
          console.error("获取弹幕失败:", error);
          console.log("获取弹幕失败:", data);
          resolve([]);
        });
    });
  };
}