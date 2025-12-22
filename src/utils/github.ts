import { cacheGitHubStars, getCachedGitHubStars } from './storage';

const REPO_OWNER = 'fuck-algorithm';
const REPO_NAME = 'leetcode-48-rotate-image';
export const REPO_URL = `https://github.com/${REPO_OWNER}/${REPO_NAME}`;

export async function fetchGitHubStars(): Promise<number> {
  // 先检查缓存
  const cached = await getCachedGitHubStars();
  if (cached !== null) {
    return cached;
  }

  try {
    const response = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch');
    }
    
    const data = await response.json();
    const stars = data.stargazers_count || 0;
    
    // 缓存结果
    await cacheGitHubStars(stars);
    
    return stars;
  } catch {
    // 获取失败时尝试读取过期缓存
    const fallback = await getCachedGitHubStars();
    return fallback ?? 0;
  }
}
