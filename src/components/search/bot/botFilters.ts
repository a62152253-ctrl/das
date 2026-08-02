import { Company, Service } from '../../../types';
import { VISIBILITY_TIER_SCORE, MAX_RESULTS } from './botConstants';

/**
 * Pre-compile search pattern once to avoid repeated toLowerCase calls
 */
function buildSearchPattern(term: string): string {
  return term.toLowerCase().trim();
}

/**
 * Create single searchable string from company/service fields
 * Cached per service to avoid repeated concatenation
 */
function buildSearchHaystack(service: Service, company: Company): string {
  return [
    company.companyName,
    company.description,
    company.services,
    company.category,
    service.name,
    service.category,
    service.description,
    company.city,
    company.address
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

/**
 * Filter services with optimized logic: early returns, no repeated operations
 */
export function filterMatchingServices(
  services: Service[],
  companies: Company[],
  selectedCategory: string | null,
  budgetOption: number | null,
  urgency: string | null
): Array<{ service: Service; company: Company }> {
  if (!selectedCategory || !budgetOption || !urgency) return [];

  const searchPattern = buildSearchPattern(selectedCategory);
  const maxBudget = budgetOption === 999999 ? Infinity : budgetOption;
  const companyMap = new Map(companies.map(c => [c.uid, c]));

  const filtered: Array<{ service: Service; company: Company }> = [];

  for (const service of services) {
    // Early return: inactive services
    if (!service.isActive) continue;

    // Early return: no parent company
    const company = companyMap.get(service.companyId);
    if (!company) continue;

    // Early return: budget mismatch
    if (service.price > maxBudget) continue;

    // Search match (only if search term provided)
    if (searchPattern && !buildSearchHaystack(service, company).includes(searchPattern)) {
      continue;
    }

    // Urgency check: verify opening hours if "today" requested
    if (urgency === 'today' && !company.openingHours) {
      continue;
    }

    filtered.push({ service, company });
  }

  // Sort by visibility tier first, then rating
  filtered.sort((a, b) => {
    const tierDiff =
      (VISIBILITY_TIER_SCORE[a.company.visibilityPackage as string] || 0) -
      (VISIBILITY_TIER_SCORE[b.company.visibilityPackage as string] || 0);

    if (tierDiff !== 0) return -tierDiff;

    return (b.company.rating || 0) - (a.company.rating || 0);
  });

  return filtered.slice(0, MAX_RESULTS);
}
