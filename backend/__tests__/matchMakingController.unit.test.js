// __tests__/matchMakingController.unit.test.js

const {
  matchByLocation,
  matchBySkills,
  matchByDate,
  totalMatchPercentage,
  rankEventsByMatch,
} = require("../controllers/matchMakingController");

// Helpers
function makeUser({
  preferredLocations = [],
  skills = [],
  preferredDates = [],
} = {}) {
  return { preferredLocations, skills, preferredDates };
}

function makeEvent({
  title = "Test Event",
  location = "",
  skillsNeeded = [],
  date = null,
} = {}) {
  return { title, location, skillsNeeded, date };
}

describe("matchMakingController unit tests", () => {

  // --------------------------------------------------
  // Extra coverage for normDate
  // --------------------------------------------------
  describe("normDate additional coverage", () => {
    const { normDate } = require("../controllers/matchMakingController");

    test("normDate returns empty string when value is null/undefined", () => {
      expect(normDate(null)).toBe("");
      expect(normDate(undefined)).toBe("");
    });

    test("normDate handles YY-MM-DD → 20YY conversion", () => {
      expect(normDate("25-11-02")).toBe("2025-11-02"); // 25 → 2025
      expect(normDate("75-01-05")).toBe("1975-01-05"); // 75 → 1975
    });
  });

  // --------------------------------------------------
  // matchByLocation
  // --------------------------------------------------
  describe("matchByLocation", () => {
    test("returns 1 when any preferred city matches", () => {
      const user = makeUser({ preferredLocations: ["Houston", "Katy"] });
      const event = makeEvent({ location: "123 Houston TX" });
      expect(matchByLocation(user, event)).toBe(1);
    });

    test("returns 0 when no city matches", () => {
      const user = makeUser({ preferredLocations: ["Katy"] });
      const event = makeEvent({ location: "Dallas TX" });
      expect(matchByLocation(user, event)).toBe(0);
    });

    test("returns 0 when preferredLocations missing", () => {
      expect(matchByLocation({}, makeEvent({ location: "Houston" }))).toBe(0);
    });

    test("returns 0 when event.location missing", () => {
      const user = makeUser({ preferredLocations: ["Houston"] });
      expect(matchByLocation(user, makeEvent({ location: "" }))).toBe(0);
    });
  });

  // --------------------------------------------------
  // matchBySkills
  // --------------------------------------------------
  describe("matchBySkills", () => {
    test("returns full match", () => {
      const user = makeUser({ skills: ["Cooking", "Driving"] });
      const event = makeEvent({ skillsNeeded: ["driving"] });
      expect(matchBySkills(user, event)).toBe(1);
    });

    test("returns fractional match", () => {
      const user = makeUser({ skills: ["Cooking"] });
      const event = makeEvent({ skillsNeeded: ["cooking", "driving"] });
      expect(matchBySkills(user, event)).toBeCloseTo(0.5);
    });

    test("returns 0 when no overlap", () => {
      const user = makeUser({ skills: ["Cooking"] });
      const event = makeEvent({ skillsNeeded: ["first aid"] });
      expect(matchBySkills(user, event)).toBe(0);
    });

    test("returns 0 if skillsNeeded empty", () => {
      const user = makeUser({ skills: ["Cooking"] });
      const event = makeEvent({ skillsNeeded: [] });
      expect(matchBySkills(user, event)).toBe(0);
    });
  });

  // --------------------------------------------------
  // matchByDate
  // --------------------------------------------------
  describe("matchByDate", () => {
    test("returns 1 when dates match", () => {
      const user = makeUser({ preferredDates: ["2025-11-02"] });
      const event = makeEvent({ date: "2025-11-02" });
      expect(matchByDate(user, event)).toBe(1);
    });

    test("returns 0 when no dates match", () => {
      const user = makeUser({ preferredDates: ["2025-11-02"] });
      const event = makeEvent({ date: "2025-11-04" });
      expect(matchByDate(user, event)).toBe(0);
    });

    test("supports Date objects", () => {
      const user = makeUser({ preferredDates: [new Date("2025-11-02")] });
      const event = makeEvent({ date: "2025-11-02" });
      expect(matchByDate(user, event)).toBe(1);
    });
  });

  // --------------------------------------------------
  // totalMatchPercentage
  // --------------------------------------------------
  describe("totalMatchPercentage", () => {
    test("correctly weights each metric", () => {
      expect(totalMatchPercentage(1, 0.5, 1)).toBe(80);
    });

    test("results in 0 for all zeros", () => {
      expect(totalMatchPercentage(0, 0, 0)).toBe(0);
    });

    test("rounds correctly", () => {
      expect(totalMatchPercentage(1 / 3, 0, 0)).toBe(13);
    });
  });

  // --------------------------------------------------
  // rankEventsByMatch
  // --------------------------------------------------
  describe("rankEventsByMatch", () => {
    test("sorts events by matchPercentage", () => {
      const user = makeUser({
        preferredLocations: ["Houston"],
        skills: ["cooking"],
        preferredDates: ["2025-11-02"],
      });

      const events = [
        makeEvent({
          title: "No Match",
          location: "Austin",
          skillsNeeded: ["first aid"],
          date: "2025-12-01",
        }),
        makeEvent({
          title: "Perfect Match",
          location: "Houston",
          skillsNeeded: ["cooking"],
          date: "2025-11-02",
        }),
        makeEvent({
          title: "Skills Only",
          location: "Dallas",
          skillsNeeded: ["cooking"],
          date: "2025-11-03",
        }),
      ];

      const ranked = rankEventsByMatch(user, events);

      const titles = ranked.map((e) => e.title);
      expect(titles).toEqual(["Perfect Match", "Skills Only", "No Match"]);
    });

    // EXTRA COVERAGE: test tie-breaker (line 166)
    test("sorts by title alphabetically when matchPercentage ties", () => {
      const user = makeUser({});

      const events = [
        { title: "Bravo",  location: "", skillsNeeded: [], date: "" },
        { title: "Alpha",  location: "", skillsNeeded: [], date: "" },
      ];

      const ranked = rankEventsByMatch(user, events);

      expect(ranked.map(e => e.title)).toEqual(["Alpha", "Bravo"]);
    });

    test("returns [] when no events", () => {
      expect(rankEventsByMatch(makeUser(), [])).toEqual([]);
    });
  });

});
