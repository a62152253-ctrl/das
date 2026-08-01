import { Company } from '../types';

export function getRecommendedCompanies(companies: Company[]): Company[] {
  const searchLogsStr = localStorage.getItem('lokalnie_search_logs');
  let searchedTerms: string[] = [];
  if (searchLogsStr) {
    try {
      const logs = JSON.parse(searchLogsStr);
      searchedTerms = logs.map((l: any) => l.query.toLowerCase());
    } catch (e) {}
  }

  const scored = companies.map(c => {
    let score = 0;
    
    // Visibility Tier Bonus
    if (c.visibilityPackage === 'platinum') score += 100;
    else if (c.visibilityPackage === 'gold') score += 60;
    else if (c.visibilityPackage === 'silver') score += 25;

    // Review rating strength
    score += (c.rating || 0) * 12;

    // Search query matches for personalized targeting
    const matchesLog = searchedTerms.some(term => 
      c.companyName.toLowerCase().includes(term) || 
      c.services.toLowerCase().includes(term) || 
      c.description.toLowerCase().includes(term)
    );
    
    if (matchesLog) {
      score += 45;
    }

    return { company: c, score };
  });

  // Sort descending by calculated score
  scored.sort((a, b) => b.score - a.score);
  return scored.map(s => s.company).slice(0, 3);
}
