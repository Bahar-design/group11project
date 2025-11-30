const {
  matchByLocation,
  matchBySkills,
  matchByDate,
  totalMatchPercentage,
  rankEventsByMatch
} = require("../controllers/matchMakingController.js");


//* TESTING FOR MATCH BY LOCATION
describe("matchByLocation", () => {
  test("returns 1 when user's preferred locations include event location", () => {
    const user = { preferredLocations: ["Houston", "Katy"] };
    const event = { location: "Houston" };

    expect(matchByLocation(user, event)).toBe(1);
  });

  test("returns 0 when user's preferred locations do not include event location", () => {
    const user = { preferredLocations: ["Katy", "Sugarland"] };
    const event = { location: "Houston" };

    expect(matchByLocation(user, event)).toBe(0);
  });
});


//* TESTING FOR MATCH BY SKILLS
describe("matchBySkills", () => {
  test("returns 0 when there are no shared skills", () => {
    const user = { skills: ["leadership"] };
    const event = { skillsNeeded: ["tailoring"] };

    expect(matchBySkills(user, event)).toBe(0.0);
  });

  test("returns a decimal for partial match", () => {
    const user = { skills: ["leadership", "tailoring", "logistics"] };
    const event = { skillsNeeded: ["tailoring", "leadership", "knitting"] };

    expect(matchBySkills(user, event)).toBeCloseTo(0.67, 2);
  });

  test("returns 1 when all skills match", () => {
    const user = { skills: ["leadership", "tailoring", "logistics"] };
    const event = { skillsNeeded: ["tailoring", "leadership", "logistics"] };

    expect(matchBySkills(user, event)).toBe(1);
  });
});


//* TESTING FOR TOTAL MATCH PERCENTAGE
describe("totalMatchPercentage", () => {

  test("returns 0 for no match at all", () => {
    const user = {
      preferredLocations: ["Katy", "Sugarland"],
      preferredDates: ["2025-04-01"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "Houston",
      date: "2025-12-25",
      skillsNeeded: ["sewing", "hemming", "stitching"]
    };

    const result = totalMatchPercentage(
      matchByLocation(user, event),
      matchBySkills(user, event),
      matchByDate(user, event)
    );

    expect(result).toBe(0);
  });

  test("returns 100 for perfect match", () => {
    const user = {
      preferredLocations: ["Katy"],
      preferredDates: ["2025-04-01"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "Katy",
      date: "2025-04-01",
      skillsNeeded: ["tailoring", "leadership", "logistics"]
    };

    const result = totalMatchPercentage(
      matchByLocation(user, event),
      matchBySkills(user, event),
      matchByDate(user, event)
    );

    expect(result).toBe(100);
  });

  test("partial match — location mismatch", () => {
    const user = {
      preferredLocations: ["Katy"],
      preferredDates: ["2025-04-01"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "Houston",
      date: "2025-04-01",
      skillsNeeded: ["tailoring", "leadership", "logistics"]
    };

    // loc=0, skills=1, date=1
    // total = 0.4*0 + 0.4*1 + 0.2*1 = 0.6 → 60%
    expect(
      totalMatchPercentage(
        matchByLocation(user, event),
        matchBySkills(user, event),
        matchByDate(user, event)
      )
    ).toBe(60);
  });

  test("partial match — one skill match", () => {
    const user = {
      preferredLocations: ["Katy"],
      preferredDates: ["2025-04-01"],
      skills: ["logistics"]
    };

    const event = {
      location: "Katy",
      date: "2025-04-01",
      skillsNeeded: ["sewing", "painting", "logistics"]
    };

    // loc=1, skill=1/3 ≈ 0.33, date=1
    const result = totalMatchPercentage(
      matchByLocation(user, event),
      matchBySkills(user, event),
      matchByDate(user, event)
    );

    // 0.4*1 + 0.4*(0.33) + 0.2*1 = 0.4 + 0.132 + 0.2 = 0.732 → 73%
    expect(result).toBe(73);
  });

});


//* TESTING EVENT RANKING
describe("rankEventsByMatch", () => {
  test("events ranked correctly by match percentage", () => {
    const user = {
      preferredLocations: ["Houston", "Katy"],
      preferredDates: ["2025-04-01", "2025-04-02"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const events = [
      {
        name: "Community Tailor Drive",
        location: "Houston",
        date: "2025-04-01",
        skillsNeeded: ["tailoring", "leadership", "knitting"]
      },
      {
        name: "Logistics Workshop",
        location: "Katy",
        date: "2025-04-03",
        skillsNeeded: ["logistics", "leadership"]
      },
      {
        name: "Art Fair",
        location: "Austin",
        date: "2025-04-01",
        skillsNeeded: ["painting"]
      }
    ];

    const ranked = rankEventsByMatch(user, events);

    expect(ranked.map(e => e.matchPercentage)).toEqual(
      expect.arrayContaining([
        ranked[0].matchPercentage,
        ranked[1].matchPercentage,
        ranked[2].matchPercentage,
      ])
    );

    expect(ranked[0].matchPercentage).toBeGreaterThanOrEqual(ranked[1].matchPercentage);
    expect(ranked[1].matchPercentage).toBeGreaterThanOrEqual(ranked[2].matchPercentage);
  });
});
