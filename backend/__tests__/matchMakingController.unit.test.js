// __tests__/matchMakingController.unit.test.js

const {
    matchByLocation,
    matchBySkills,
    matchByDate,
    totalMatchPercentage,
    rankEventsByMatch,
  } = require("../controllers/matchMakingController");
  
  // Helpers for building user/event objects to keep tests clean
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
    // matchByLocation
    // --------------------------------------------------
    describe("matchByLocation", () => {
      test("returns 1 when any preferred city is a substring of event.location (case-insensitive)", () => {
        const user = makeUser({
          preferredLocations: ["Houston", "Katy"],
        });
  
        const event = makeEvent({
          location: "123 Main St, Houston, TX 77002",
        });
  
        expect(matchByLocation(user, event)).toBe(1);
      });
  
      test("returns 0 when none of the preferred cities match event.location", () => {
        const user = makeUser({
          preferredLocations: ["Cypress", "Katy"],
        });
  
        const event = makeEvent({
          location: "123 Main St, Dallas, TX 75201",
        });
  
        expect(matchByLocation(user, event)).toBe(0);
      });
  
      test("returns 0 when preferredLocations is missing or empty", () => {
        const user1 = makeUser({ preferredLocations: [] });
        const event = makeEvent({ location: "Houston, TX" });
  
        expect(matchByLocation(user1, event)).toBe(0);
        expect(matchByLocation(null, event)).toBe(0);
        expect(matchByLocation({}, event)).toBe(0);
      });
  
      test("returns 0 when event.location is missing", () => {
        const user = makeUser({ preferredLocations: ["Houston"] });
        const event = makeEvent({ location: "" });
  
        expect(matchByLocation(user, event)).toBe(0);
      });
    });
  
    // --------------------------------------------------
    // matchBySkills
    // --------------------------------------------------
    describe("matchBySkills", () => {
      test("returns 1 when all event skills are matched by user skills (case-insensitive)", () => {
        const user = makeUser({
          skills: ["Cooking", "Driving", "Serving"],
        });
  
        const event = makeEvent({
          skillsNeeded: ["serving", "driving"], // both covered by user
        });
  
        expect(matchBySkills(user, event)).toBe(1);
      });
  
      test("returns fraction of event skills matched by user skills", () => {
        const user = makeUser({
          skills: ["Cooking", "Serving"],
        });
  
        const event = makeEvent({
          skillsNeeded: ["serving", "driving"], // 1 of 2 matched
        });
  
        expect(matchBySkills(user, event)).toBeCloseTo(0.5);
      });
  
      test("returns 0 when there is no overlap in skills", () => {
        const user = makeUser({
          skills: ["Cooking", "Serving"],
        });
  
        const event = makeEvent({
          skillsNeeded: ["driving", "first aid"],
        });
  
        expect(matchBySkills(user, event)).toBe(0);
      });
  
      test("returns 0 when event.skillsNeeded is empty or user is missing", () => {
        const user = makeUser({ skills: ["Cooking"] });
        const eventEmpty = makeEvent({ skillsNeeded: [] });
        const event = makeEvent({ skillsNeeded: ["cooking"] });
  
        expect(matchBySkills(user, eventEmpty)).toBe(0);
        expect(matchBySkills(null, event)).toBe(0);
        expect(matchBySkills({}, event)).toBe(0);
      });
    });
  
    // --------------------------------------------------
    // matchByDate
    // --------------------------------------------------
    describe("matchByDate", () => {
      test("returns 1 when any preferred date equals event date (YYYY-MM-DD)", () => {
        const user = makeUser({
          preferredDates: ["2025-11-02", "2025-11-04"],
        });
  
        const event = makeEvent({
          date: "2025-11-04",
        });
  
        expect(matchByDate(user, event)).toBe(1);
      });
  
      test("returns 0 when no preferred dates match event date", () => {
        const user = makeUser({
          preferredDates: ["2025-11-02", "2025-11-04"],
        });
  
        const event = makeEvent({
          date: "2025-11-06",
        });
  
        expect(matchByDate(user, event)).toBe(0);
      });
  
      test("handles Date objects via normDate", () => {
        const user = makeUser({
          preferredDates: [new Date("2025-11-02")],
        });
  
        const event = makeEvent({
          date: "2025-11-02",
        });
  
        expect(matchByDate(user, event)).toBe(1);
      });
  
      test("returns 0 when user or dates are missing", () => {
        const event = makeEvent({ date: "2025-11-02" });
  
        expect(matchByDate(null, event)).toBe(0);
        expect(matchByDate({}, event)).toBe(0);
      });
    });
  
    // --------------------------------------------------
    // totalMatchPercentage
    // --------------------------------------------------
    describe("totalMatchPercentage", () => {
      test("combines scores with weights 0.4 (location), 0.4 (skills), 0.2 (date)", () => {
        // loc=1, skills=0.5, date=1
        // raw = 0.4*1 + 0.4*0.5 + 0.2*1 = 0.8 => 80%
        const result = totalMatchPercentage(1, 0.5, 1);
        expect(result).toBe(80);
      });
  
      test("returns 0 when all scores are 0", () => {
        const result = totalMatchPercentage(0, 0, 0);
        expect(result).toBe(0);
      });
  
      test("rounds to nearest integer percent", () => {
        // raw ≈ 0.1333, *100 ≈ 13.33 → 13
        const result = totalMatchPercentage(1 / 3, 0, 0);
        expect(result).toBe(13);
      });
    });
  
    // --------------------------------------------------
    // rankEventsByMatch
    // --------------------------------------------------
    describe("rankEventsByMatch", () => {
      test("adds matchPercentage and sorts events in descending order", () => {
        const user = makeUser({
          preferredLocations: ["Houston"],
          skills: ["cooking"],
          preferredDates: ["2025-11-02"],
        });
  
        const eventPerfect = makeEvent({
          title: "Perfect Match",
          location: "Houston, TX",
          skillsNeeded: ["cooking"],
          date: "2025-11-02",
        });
  
        const eventSkillsOnly = makeEvent({
          title: "Skills Only",
          location: "Dallas, TX",
          skillsNeeded: ["cooking"],
          date: "2025-11-03",
        });
  
        const eventNoMatch = makeEvent({
          title: "No Match",
          location: "Austin, TX",
          skillsNeeded: ["driving"],
          date: "2025-11-04",
        });
  
        const events = [eventNoMatch, eventPerfect, eventSkillsOnly];
  
        const ranked = rankEventsByMatch(user, events);
  
        // Ensure same length and each has matchPercentage
        expect(ranked).toHaveLength(3);
        ranked.forEach((ev) => {
          expect(ev).toHaveProperty("matchPercentage");
          expect(typeof ev.matchPercentage).toBe("number");
          expect(ev.matchPercentage).toBeGreaterThanOrEqual(0);
          expect(ev.matchPercentage).toBeLessThanOrEqual(100);
        });
  
        // Ensure order: Perfect > SkillsOnly > NoMatch
        const titlesInOrder = ranked.map((e) => e.title);
        expect(titlesInOrder).toEqual(["Perfect Match", "Skills Only", "No Match"]);
      });
  
      test("returns empty array when events array is empty", () => {
        const user = makeUser({
          preferredLocations: ["Houston"],
        });
  
        const ranked = rankEventsByMatch(user, []);
        expect(ranked).toEqual([]);
      });
    });
  });