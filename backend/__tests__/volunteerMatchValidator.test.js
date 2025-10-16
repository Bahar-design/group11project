const { matchByLocation, matchByTimeslot, matchBySkills, totalMatchPercentage} = require("../validators/matchByLocation");




//*TESTING FOR MATCH BY LOCATION FUNCTION

describe("matchByLocation", () => {
  test("returns 1 when user's preferred locations include event location", () => {
    const user = {
      preferredLocations: ["Houston", "Katy"]
    };

    const event = {
      location: ["Houston"]
    };

    expect(matchByLocation(user, event)).toBe(1);
  });

  test("returns 0 when user's preferred locations do not include event location", () => {
    const user = {
      preferredLocations: ["Katy", "Sugarland"],
    };

    const event = {
      location: ["Houston"]
    };

    expect(matchByLocation(user, event)).toBe(0);
  });
});


//*TESTING FOR MATCH BY TIMESLOT FUNCTION
describe("matchByTimeslot", () => {
  test("return 1 when users preferred preferred time is included in the event timeSlot", () => {

    const user = {
      preferredSlots: ["3pm-6pm"]
    };

    const event = {
      timeSlots: ["3pm-6pm"]
    };

    expect(matchByTimeslot(user, event)).toBe(1);
  });

  test("return 0 when users preferred preferred time is not included in the event timeSlot", () => {

    const user = {
      preferredSlots: ["12pm-3pm"]
    };

    const event = {
      timeSlots: ["3pm-6pm"]
    };

    expect(matchByTimeslot(user, event)).toBe(0);
  });
});


//*TESTING FOR MATCH BY SKILLS FUNCTION
describe("matchBySkills", () => {
  test("should return 0 if there are no skills shared between the event and the user", () => {
    const user = {
      skills: ["leadership"]
    };

    const event = {
      skillsNeeded: ["tailoring"]
    };

    expect(matchBySkills(user, event)).toBe(0.00);
  });


  test("should return a decimal if there are some skills shared between the event and the user", () => {
    const user = {
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      skillsNeeded: ["tailoring", "leadership", "knitting"]
    };

    expect(matchBySkills(user, event)).toBeCloseTo(0.67, 2);
  });


  test("should return a 1 user contains all the skills needed for an event", () => {
    const user = {
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      skillsNeeded: ["tailoring", "leadership", "logistics"]
    };

    expect(matchBySkills(user, event)).toBe(1);
  });

});










//*TESTING FOR TOTAL MATCH PERCENTAGE`  FUNCTION
describe("totalMatchPercentage", () => {

  test("should return 0 since there is no match", () => {
    
    const user = {
      preferredLocations: ["Katy", "Sugarland"],
      preferredSlots: ["12pm-3pm"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: ["Houston"],
      timeSlots: ["3pm-6pm"],
      skillsNeeded: ["sewing", "hemming", "stitching"]
    };


    expect(totalMatchPercentage(user, event)).toBe(0);
  });


  test("should return 100 since there is absolute match between user and event", () => {

    const user = {
      preferredLocations: ["Katy", "Sugarland"],
      preferredSlots: ["12pm-3pm"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "Katy",
      timeSlots: ["12pm-3pm"],
      skillsNeeded: ["tailoring", "leadership", "logistics"]
    };


    expect(totalMatchPercentage(user, event)).toBe(100);
  });





  test("should return decimal since there are some matchs between user and event (modded the locations)", () => {

    const user = {
      preferredLocations: ["Katy", "Sugarland"],
      preferredSlots: ["12pm-3pm"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "HouSton",
      timeSlots: ["12pm-3pm"],
      skillsNeeded: ["tailoring", "leadership", "logistics"]
    };

    expect(totalMatchPercentage(user, event)).toBe(67);
  });
  test("should return decimal since there are some matchs between user and event (modded the time-slot)", () => {

    const user = {
      preferredLocations: ["Katy", "Sugarland"],
      preferredSlots: ["12pm-3pm"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "Sugarland",
      timeSlots: ["3pm-6pm"],
      skillsNeeded: ["tailoring", "leadership", "logistics"]
    };

    expect(totalMatchPercentage(user, event)).toBe(67);
  });
  test("should return decimal since there are some matchs between user and event (modded the skills)", () => {

    const user = {
      preferredLocations: ["Katy", "Sugarland"],
      preferredSlots: ["12pm-3pm"],
      skills: ["leadership", "tailoring", "logistics"]
    };

    const event = {
      location: "Sugarland",
      timeSlots: ["12pm-3pm"],
      skillsNeeded: ["sewing", "knitting", "logistics"]
    };

    expect(totalMatchPercentage(user, event)).toBe(78);
  });


});
