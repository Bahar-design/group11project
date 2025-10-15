//?need to added address underneath the event card in order to properly allow user to find the location
        //?possible adding of googlemaps or redirecting to the google maps website





//! create it to were there is a specific order to the event cards! so only the proper events are listed that match the users 
//!total match percentage

// --- Simple data --------------------------------------------------
    const event = {
    name: "Community Tailor Drive",
    location: "Houston",                 // <-- used also an event should only have one location
    timeSlots: ["12pm-3pm"],             // future use
    skillsNeeded: ["tailoring", "butchering", "cleaning"]          // future use
  };
  
  const user = {
    name: "Gabriel",
    preferredLocations: ["Houston", "katy"],  // <-- used for matching now
    preferredSlots: ["12pm-3pm", "3pm-6pm"],  // future use
    skills: ["tailoring", "butchering", "cleaning"]       // future use
  };
  
  // --- Location-only matcher ----------------------------------------
  const norm = s => String(s).trim().toLowerCase();










    //* this is the match making function for the evemt based on the location

  function matchByLocation(user, event) {
    const userLocs = new Set(user.preferredLocations.map(norm));
    const evLoc = norm(event.location);
    return userLocs.has(evLoc) ? 1 : 0; // true = match, false = no match! need to implement returning of either 0 or 1 for percentage rating
  }
  









    //* now we implement the match making for the matchByTimeslot  
  function matchByTimeslot(user, event){
    const userTimes = new Set(user.preferredSlots.map(norm));
    const evTimes = norm(event.timeSlots);
    return userTimes.has(evTimes) ? 1 : 0;
  } 








  //!possibly could have incorrect match making because the match making is done here with seeing if the user
  //! has a skill which is listed in the event
  function matchBySkills(user, event) {
    const evSkills = new Set(event.skillsNeeded.map(norm));
    const userSkills = user.skills.map(norm)

    let skillCount = 0;

    for(const skill of userSkills){
      if(evSkills.has(skill)){
        skillCount += 1;
      }
    }

    const  skillsMatchedPercentage = Number((skillCount/evSkills.size).toFixed(2));

    return skillsMatchedPercentage;

  }

  function totalMatchPercentage(user,event) {
    const locScore = matchByLocation(user, event);
    const timeScore = matchByTimeslot(user, event);
    const skillsScores = Number(matchBySkills(user,event));
    const final = Number( ( ( ( locScore + timeScore + skillsScores ) / 3 ) * 100 ).toFixed(0) );

    return final;
  }

  // let Final = totalMatchPercentage(user, event);
  // console.log(Final)


  module.exports = { matchByLocation, matchByTimeslot, matchBySkills, totalMatchPercentage};
