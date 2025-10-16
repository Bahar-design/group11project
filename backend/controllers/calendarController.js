let calendarEvents = [];
let nextId = 1;

// GET all events
exports.getAllEvents = (req, res) => {
  res.status(200).json(calendarEvents);
};

// POST create new event
exports.createEvent = (req, res) => {
  const { title, description, date, location, attendees } = req.body;

  if (!title || !description || !date || !location) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  const newEvent = {
    id: nextId++,
    title,
    description,
    date,
    location,
    attendees: attendees || []
  };

  calendarEvents.push(newEvent);
  res.status(201).json(newEvent);
};

// PUT update an event
exports.updateEvent = (req, res) => {
  const { id } = req.params;
  const eventIndex = calendarEvents.findIndex(e => e.id === parseInt(id));

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  calendarEvents[eventIndex] = {
    ...calendarEvents[eventIndex],
    ...req.body
  };

  res.status(200).json(calendarEvents[eventIndex]);
};

// DELETE an event
exports.deleteEvent = (req, res) => {
  const { id } = req.params;
  const eventIndex = calendarEvents.findIndex(e => e.id === parseInt(id));

  if (eventIndex === -1) {
    return res.status(404).json({ error: 'Event not found.' });
  }

  const deletedEvent = calendarEvents.splice(eventIndex, 1)[0];
  res.status(200).json(deletedEvent);
};
