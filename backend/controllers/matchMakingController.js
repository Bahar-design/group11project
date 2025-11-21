// backend/controllers/matchMakingController.js

// --- Helpers ------------------------------------------------------

// Normalize strings (lowercase, trimmed)
const norm = (s) => String(s).trim().toLowerCase();

// Normalize dates to 'YYYY-MM-DD'
function normDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    // If it’s some string like '12/12/2026' and Date can’t parse,
    // we just compare raw trimmed strings.
    return String(value).trim();
  }
  return d.toISOString().slice(0, 10); // 'YYYY-MM-DD'
}

// --- Matchers ------------------------------------------------------

/**
 * Location match:
 *  - user.preferredLocations: array of city names, e.g. ["Katy", "Fulshear", "Woodlands"]
 *  - event.location: full address string.
 * Returns:
 *  - 1 if ANY preferred city appears as a substring of event.location (case-insensitive)
 *  - 0 otherwise
 */
function matchByLocation(user, event) {
  if (
    !user ||
    !Array.isArray(user.preferredLocations) ||
    user.preferredLocations.length === 0 ||
    !event ||
    !event.location
  ) {
    return 0;
  }

  const locStr = norm(event.location);

  for (const cityRaw of user.preferredLocations) {
    const city = norm(cityRaw);
    if (!city) continue;

    if (locStr.includes(city)) {
      return 1;
    }
  }

  return 0;
}

/**
 * Skills match:
 *  - user.skills: array of skill names
 *  - event.skillsNeeded: array of skill names
 * Returns:
 *  - fraction between 0 and 1 of event skills that user has
 */
function matchBySkills(user, event) {
  if (!user || !user.skills || !event || !event.skillsNeeded) return 0;

  const evSkills = new Set(event.skillsNeeded.map(norm));
  const userSkills = user.skills.map(norm);

  let skillCount = 0;
  for (const skill of userSkills) {
    if (evSkills.has(skill)) {
      skillCount += 1;
    }
  }

  if (evSkills.size === 0) return 0;

  const skillsMatchedFraction = skillCount / evSkills.size;
  return Number(skillsMatchedFraction.toFixed(2)); // e.g. 0.33, 0.67, 1.0
}

/**
 * Date match:
 *  - user.preferredDates: array of dates (strings or Date-like)
 *  - event.date: single date (string or Date-like)
 * Returns:
 *  - 1 if any preferred date equals the event date
 *  - 0 otherwise
 */
function matchByDate(user, event) {
  if (
    !user ||
    !user.preferredDates ||
    user.preferredDates.length === 0 ||
    !event ||
    !event.date
  ) {
    return 0;
  }

  const userDates = new Set(user.preferredDates.map(normDate));
  const evDate = normDate(event.date);

  return userDates.has(evDate) ? 1 : 0;
}

/**
 * Combine individual scores into a 0..100% overall match.
 * All inputs are in [0,1].
 *
 * Adjust weights as desired.
 */
function totalMatchPercentage(locScore, skillScore, dateScore) {
  const WEIGHT_LOCATION = 0.4;
  const WEIGHT_SKILLS   = 0.4;
  const WEIGHT_DATE     = 0.2;

  const raw =
    WEIGHT_LOCATION * locScore +
    WEIGHT_SKILLS   * skillScore +
    WEIGHT_DATE     * dateScore;

  return Math.round(raw * 100);
}

/**
 * Utility: score and sort a list of events for a given user.
 */
function rankEventsByMatch(user, events) {
  const scoredEvents = events.map((event) => {
    const locScore   = matchByLocation(user, event);
    const skillScore = matchBySkills(user, event);
    const dateScore  = matchByDate(user, event);

    return {
      ...event,
      matchPercentage: totalMatchPercentage(
        locScore,
        skillScore,
        dateScore
      ),
    };
  });

  scoredEvents.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    return (a.title || a.name || "").localeCompare(b.title || b.name || "");
  });

  return scoredEvents;
}

module.exports = {
  matchByLocation,
  matchBySkills,
  matchByDate,
  totalMatchPercentage,
  rankEventsByMatch,
};