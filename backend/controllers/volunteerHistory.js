let volunteerHistory = [];
let nextId = 1;

// GET all volunteer records
exports.getVolunteerHistory = (req, res) => {
  res.status(200).json(volunteerHistory);
};

// POST create a new record
exports.createVolunteerRecord = (req, res) => {
  const { volunteerName, eventName, hoursServed, skillsUsed, date } = req.body;

  if (!volunteerName || !eventName || !hoursServed || !Array.isArray(skillsUsed) || skillsUsed.length === 0 || !date) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const newRecord = {
    id: nextId++,
    volunteerName,
    eventName,
    hoursServed,
    skillsUsed,
    date,
  };

  volunteerHistory.push(newRecord);
  res.status(201).json(newRecord);
};

// PUT update a record
exports.updateVolunteerRecord = (req, res) => {
  const id = parseInt(req.params.id);
  const index = volunteerHistory.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const { volunteerName, eventName, hoursServed, skillsUsed, date } = req.body;

  volunteerHistory[index] = {
    id,
    volunteerName,
    eventName,
    hoursServed,
    skillsUsed,
    date,
  };

  res.status(200).json(volunteerHistory[index]);
};

// DELETE a record
exports.deleteVolunteerRecord = (req, res) => {
  const id = parseInt(req.params.id);
  const index = volunteerHistory.findIndex((r) => r.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Record not found' });
  }

  const deleted = volunteerHistory.splice(index, 1)[0];
  res.status(200).json(deleted);
};
