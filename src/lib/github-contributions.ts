interface ContributionSourceProject {
  id: string;
  projectType: 'personal' | 'contribution';
  visibility: 'public' | 'private';
  repository?: string;
}

export interface ContributionStats {
  owner: string;
  repo: string;
  mergedCount: number;
  reviewCount: number;
  searchUrl: string;
  reviewSearchUrl: string;
  items: { title: string; url: string; mergedAt: string | null }[];
}

interface GitHubSearchItem {
  title: string;
  html_url: string;
  closed_at: string | null;
}

interface GitHubSearchResponse {
  total_count: number;
  items: GitHubSearchItem[];
}

const parseGitHubRepo = (url: string): { owner: string; repo: string } | null => {
  const match = url.match(/github\.com\/([^/]+)\/([^/]+?)\/?$/);
  return match ? { owner: match[1], repo: match[2] } : null;
};

const searchIssueCount = async (query: string): Promise<number | null> => {
  try {
    const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;
    const data: GitHubSearchResponse = await res.json();
    return data.total_count ?? 0;
  } catch {
    return null;
  }
};

export async function getContributionStats(repoUrl: string, username: string): Promise<ContributionStats | null> {
  const parsed = parseGitHubRepo(repoUrl);
  if (!parsed) return null;
  const { owner, repo } = parsed;

  const mergedQuery = `repo:${owner}/${repo} author:${username} type:pr is:merged`;
  const searchUrl = `https://github.com/${owner}/${repo}/pulls?q=${encodeURIComponent(`is:pr author:${username} is:merged`)}`;
  const reviewQuery = `repo:${owner}/${repo} is:pr reviewed-by:${username}`;
  const reviewSearchUrl = `https://github.com/${owner}/${repo}/pulls?q=${encodeURIComponent(`is:pr reviewed-by:${username}`)}`;

  try {
    const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(mergedQuery)}`, {
      headers: { Accept: 'application/vnd.github+json' },
      next: { revalidate: 86400 },
    });
    if (!res.ok) return null;

    const data: GitHubSearchResponse = await res.json();
    const reviewCount = (await searchIssueCount(reviewQuery)) ?? 0;

    return {
      owner,
      repo,
      mergedCount: data.total_count ?? 0,
      reviewCount,
      searchUrl,
      reviewSearchUrl,
      items: (data.items ?? []).slice(0, 5).map(item => ({
        title: item.title,
        url: item.html_url,
        mergedAt: item.closed_at,
      })),
    };
  } catch {
    return null;
  }
}

export async function getContributionStatsForProjects<T extends ContributionSourceProject>(
  projects: T[],
  username: string
): Promise<Record<string, ContributionStats | null>> {
  const contributionProjects = projects.filter(
    p => p.projectType === 'contribution' && p.visibility === 'public' && p.repository
  );

  const entries = await Promise.all(
    contributionProjects.map(async p => [p.id, await getContributionStats(p.repository!, username)] as const)
  );

  return Object.fromEntries(entries);
}
