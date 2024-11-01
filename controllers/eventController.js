const mongoose = require('mongoose'); // Import mongoose
const Event = require("../models/Event"); // Import Event model
const Reservation = require("../models/Reservation"); // Import Reservation model
const cache = {}; // Cache store

// Create a new event
/**
 * @swagger
 * /events:
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request
 *       500:
 *         description: Internal server error
 */
exports.createEvent = async (req, res) => {
  try {
    const { title, date, capacity } = req.body;

    // Input validation
    if (!title || !date || !capacity) {
      return res
        .status(400)
        .json({ message: "All fields are required: title, date, capacity." });
    }

    // Create a new event instance
    const event = new Event({
      title,
      date,
      capacity,
      availableSlots: capacity,
      organizer: req.user.id, // Assuming req.user is populated by the authentication middleware
    });
    await event.save();

    res.status(201).json({ message: "Event created successfully", event });
  } catch (error) {
    console.error("Error creating the event:", error);
    res
      .status(500)
      .json({ message: "An error occurred while creating the event." });
  }
};

// Get all events
/**
 * @swagger
 * /events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     responses:
 *       200:
 *         description: List of all events
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Event'
 *       500:
 *         description: Internal server error
 */
exports.getEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res
      .status(500)
      .json({ message: "An error occurred while fetching events." });
  }
};

// Get a specific event by ID
/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Get event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event id
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
// Get a specific event by ID
exports.getEventById = async (req, res) => {
  const { id } = req.params;

  // console.log("Received ID:", id); // Debugging line

  // Validate ObjectId format
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  // Check if the event is already in cache
  if (cache[id]) {
    return res.status(200).json(cache[id]);
  }

  try {
    const event = await Event.findById(id);
    
    // Check if event exists
    if (!event) {
      return res.status(404).json({ message: "Event not found." });
    }

    // Store the event in cache
    cache[id] = event;
    res.json(event);
  } catch (error) {
    console.error("Error fetching the event:", error);
    res.status(500).json({ message: "An error occurred while fetching the event." });
  }
};


// Update an event
/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Event'
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Bad request
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
// Update an event
exports.updateEvent = async (req, res) => {
  const { id } = req.params;
  const { title, date, capacity } = req.body;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const event = await Event.findByIdAndUpdate(
      id,
      { title, date, capacity },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event updated successfully", event });
  } catch (error) {
    console.error("Error updating the event:", error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the event." });
  }
};

// Delete an event
/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: The event id
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       404:
 *         description: Event not found
 *       500:
 *         description: Internal server error
 */
// Delete an event
exports.deleteEvent = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "Invalid ID format." });
  }

  try {
    const event = await Event.findByIdAndDelete(id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    res.json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting the event:", error);
    res
      .status(500)
      .json({ message: "An error occurred while deleting the event." });
  }
};
