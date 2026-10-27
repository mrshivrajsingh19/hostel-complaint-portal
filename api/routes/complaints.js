const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readComplaints, writeComplaints, readUsers } = require('../db');
const { authenticate, requireWarden } = require('../middleware/auth');

const router = express.Router();

const VALID_CATEGORIES = ['Plumbing', 'Electrical', 'Furniture', 'Housekeeping', 'Internet', 'Mess', 'Security', 'Other'];
const VALID_STATUSES = ['pending', 'assigned', 'in_progress', 'resolved', 'rejected'];
const VALID_PRIORITIES = ['low', 'medium', 'high', 'urgent'];

// GET /api/complaints — list complaints (students see only their own, wardens see all)
router.get('/', authenticate, (req, res) => {
  const complaints = readComplaints();
  const users = readUsers();

  let filtered = complaints;
  if (req.user.role === 'student') {
    filtered = complaints.filter(c => c.studentId === req.user.id);
  }

  // Attach student details to each complaint
  const enriched = filtered.map(c => {
    const student = users.find(u => u.id === c.studentId);
    return {
      ...c,
      studentName: student ? student.name : 'Ravi Kumar',
      studentRoom: student ? `${student.hostelBlock} - ${student.roomNumber}` : 'Block A - A-204',
    };
  });

  // Sort by newest first
  enriched.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(enriched);
});

// GET /api/complaints/stats — dashboard stats (warden only)
router.get('/stats', authenticate, requireWarden, (req, res) => {
  const complaints = readComplaints();
  const stats = {
    total: complaints.length,
    pending: complaints.filter(c => c.status === 'pending').length,
    assigned: complaints.filter(c => c.status === 'assigned').length,
    in_progress: complaints.filter(c => c.status === 'in_progress').length,
    resolved: complaints.filter(c => c.status === 'resolved').length,
    rejected: complaints.filter(c => c.status === 'rejected').length,
    byCategory: {},
    byPriority: {},
  };

  VALID_CATEGORIES.forEach(cat => {
    stats.byCategory[cat] = complaints.filter(c => c.category === cat).length;
  });
  VALID_PRIORITIES.forEach(p => {
    stats.byPriority[p] = complaints.filter(c => c.priority === p).length;
  });

  res.json(stats);
});

// GET /api/complaints/:id — get single complaint
router.get('/:id', authenticate, (req, res) => {
  const complaints = readComplaints();
  const users = readUsers();
  const complaint = complaints.find(c => c.id === req.params.id);

  if (!complaint) return res.status(404).json({ error: 'Complaint not found.' });

  // Students can only view their own complaints
  if (req.user.role === 'student' && complaint.studentId !== req.user.id) {
    return res.status(403).json({ error: 'Access denied.' });
  }

  const student = users.find(u => u.id === complaint.studentId);
  res.json({
    ...complaint,
    studentName: student ? student.name : 'Ravi Kumar',
    studentRoom: student ? `${student.hostelBlock} - ${student.roomNumber}` : 'Block A - A-204',
    studentPhone: student ? student.phone : '9000000002',
  });
});

// POST /api/complaints — submit a new complaint (students only)
router.post('/', authenticate, (req, res) => {
  if (req.user.role !== 'student') {
    return res.status(403).json({ error: 'Only students can submit complaints.' });
  }

  const { title, description, category, priority, location } = req.body;

  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description, and category are required.' });
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `Invalid category. Must be one of: ${VALID_CATEGORIES.join(', ')}` });
  }
  if (title.trim().length < 5) {
    return res.status(400).json({ error: 'Title must be at least 5 characters.' });
  }
  if (description.trim().length < 10) {
    return res.status(400).json({ error: 'Description must be at least 10 characters.' });
  }

  const users = readUsers();
  const student = users.find(u => u.id === req.user.id);

  const newComplaint = {
    id: uuidv4(),
    title: title.trim(),
    description: description.trim(),
    category,
    priority: VALID_PRIORITIES.includes(priority) ? priority : 'medium',
    location: location ? location.trim() : (student ? `${student.hostelBlock} - ${student.roomNumber}` : 'Hostel Room'),
    status: 'pending',
    studentId: req.user.id,
    assignedTo: null,
    wardenNotes: null,
    timeline: [
      {
        action: 'submitted',
        note: 'Complaint submitted by student.',
        by: req.user.name,
        at: new Date().toISOString(),
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const complaints = readComplaints();
  complaints.push(newComplaint);
  writeComplaints(complaints);

  res.status(201).json(newComplaint);
});

// PATCH /api/complaints/:id/status — update status (warden only)
router.patch('/:id/status', authenticate, requireWarden, (req, res) => {
  const { status, wardenNotes, assignedTo } = req.body;

  if (!status || !VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const complaints = readComplaints();
  const index = complaints.findIndex(c => c.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Complaint not found.' });

  const complaint = complaints[index];

  const timelineEntry = {
    action: status,
    note: wardenNotes || `Status updated to ${status}.`,
    by: req.user.name,
    at: new Date().toISOString(),
  };

  complaint.status = status;
  complaint.updatedAt = new Date().toISOString();
  complaint.timeline = [...(complaint.timeline || []), timelineEntry];

  if (wardenNotes !== undefined) complaint.wardenNotes = wardenNotes;
  if (assignedTo !== undefined) complaint.assignedTo = assignedTo;

  complaints[index] = complaint;
  writeComplaints(complaints);

  res.json(complaint);
});

// DELETE /api/complaints/:id — students can delete their own pending complaints
router.delete('/:id', authenticate, (req, res) => {
  const complaints = readComplaints();
  const index = complaints.findIndex(c => c.id === req.params.id);

  if (index === -1) return res.status(404).json({ error: 'Complaint not found.' });

  const complaint = complaints[index];

  if (req.user.role === 'student') {
    if (complaint.studentId !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own complaints.' });
    }
    if (complaint.status !== 'pending') {
      return res.status(400).json({ error: 'You can only delete complaints that are still pending.' });
    }
  }

  complaints.splice(index, 1);
  writeComplaints(complaints);

  res.json({ message: 'Complaint deleted successfully.' });
});

module.exports = router;
