const db = require("../config/db");

// ADD NOTE TO CANDIDATE
exports.addNote = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const user_id = req.user.id;
    const { candidate_id, rating, note, tags } = req.body;

    if (!candidate_id) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }
    if (!note || note.trim().length === 0) {
      return res.status(400).json({ message: "Note cannot be empty" });
    }
    if (rating && (rating < 0 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 0 and 5" });
    }

    // Verify candidate exists
    const [candidates] = await db.query(
      "SELECT * FROM candidates WHERE id = ? AND company_id = ?",
      [candidate_id, company_id]
    );
    if (candidates.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : null;

    const [result] = await db.query(
      "INSERT INTO candidate_notes (candidate_id, user_id, rating, note, tags) VALUES (?,?,?,?,?)",
      [candidate_id, user_id, rating || null, note, tagsJson]
    );

    res.json({
      id: result.insertId,
      candidate_id,
      rating,
      note,
      tags,
      created_by: req.user.full_name,
      created_at: new Date()
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET NOTES FOR CANDIDATE
exports.getNotesForCandidate = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { candidate_id } = req.params;

    // Verify candidate exists
    const [candidates] = await db.query(
      "SELECT * FROM candidates WHERE id = ? AND company_id = ?",
      [candidate_id, company_id]
    );
    if (candidates.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const [notes] = await db.query(
      "SELECT cn.*, u.full_name as created_by FROM candidate_notes cn JOIN users u ON cn.user_id = u.id WHERE cn.candidate_id = ? ORDER BY cn.created_at DESC",
      [candidate_id]
    );

    // Parse tags and ratings
    const formattedNotes = notes.map(note => ({
      ...note,
      tags: note.tags ? JSON.parse(note.tags) : []
    }));

    res.json(formattedNotes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE NOTE
exports.updateNote = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const user_id = req.user.id;
    const { id } = req.params;
    const { rating, note, tags } = req.body;

    // Verify note exists and belongs to user
    const [notes] = await db.query(
      "SELECT cn.* FROM candidate_notes cn JOIN candidates c ON cn.candidate_id = c.id WHERE cn.id = ? AND c.company_id = ?",
      [id, company_id]
    );
    if (notes.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    if (rating && (rating < 0 || rating > 5)) {
      return res.status(400).json({ message: "Rating must be between 0 and 5" });
    }

    const tagsJson = Array.isArray(tags) ? JSON.stringify(tags) : null;

    await db.query(
      "UPDATE candidate_notes SET rating = ?, note = ?, tags = ? WHERE id = ?",
      [rating !== undefined ? rating : notes[0].rating, note || notes[0].note, tagsJson || notes[0].tags, id]
    );

    res.json({ message: "Note updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE NOTE
exports.deleteNote = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { id } = req.params;

    // Verify note exists
    const [notes] = await db.query(
      "SELECT cn.* FROM candidate_notes cn JOIN candidates c ON cn.candidate_id = c.id WHERE cn.id = ? AND c.company_id = ?",
      [id, company_id]
    );
    if (notes.length === 0) {
      return res.status(404).json({ message: "Note not found" });
    }

    await db.query(
      "DELETE FROM candidate_notes WHERE id = ?",
      [id]
    );

    res.json({ message: "Note deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET CANDIDATE RATING (Average)
exports.getCandidateRating = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { candidate_id } = req.params;

    // Verify candidate exists
    const [candidates] = await db.query(
      "SELECT * FROM candidates WHERE id = ? AND company_id = ?",
      [candidate_id, company_id]
    );
    if (candidates.length === 0) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const [ratings] = await db.query(
      "SELECT AVG(rating) as average_rating, COUNT(*) as total_ratings FROM candidate_notes WHERE candidate_id = ? AND rating IS NOT NULL",
      [candidate_id]
    );

    res.json({
      candidate_id,
      average_rating: ratings[0].average_rating || 0,
      total_ratings: ratings[0].total_ratings || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// EXPORT FORMAT: Get all notes in exportable format (Excel/CSV)
exports.exportNotesReport = async (req, res) => {
  try {
    const company_id = req.user.company_id;
    const { candidate_id } = req.query;

    let query = `
      SELECT 
        c.full_name as candidate_name,
        c.email,
        c.phone,
        j.title as job_title,
        cn.rating,
        cn.note,
        cn.tags,
        u.full_name as created_by,
        cn.created_at
      FROM candidate_notes cn
      JOIN candidates c ON cn.candidate_id = c.id
      JOIN users u ON cn.user_id = u.id
      LEFT JOIN jobs j ON c.job_id = j.id
      WHERE c.company_id = ?
    `;
    let params = [company_id];

    if (candidate_id) {
      query += " AND c.id = ?";
      params.push(candidate_id);
    }

    query += " ORDER BY cn.created_at DESC";

    const [notes] = await db.query(query, params);

    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
