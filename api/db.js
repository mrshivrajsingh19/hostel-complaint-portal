const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

// In Vercel serverless, /tmp is the only writable directory
const DATA_DIR = process.env.VERCEL ? '/tmp/hcp_data' : path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');

// In-memory fallback cache
let memoryUsers = null;
let memoryComplaints = null;

function getDefaultUsers() {
  return [
    {
      id: 'usr_warden_default',
      name: 'Warden Admin',
      email: 'warden@hostel.com',
      password: bcrypt.hashSync('warden123', 10),
      role: 'warden',
      hostelBlock: null,
      roomNumber: null,
      phone: '9000000001',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'usr_student_default',
      name: 'Ravi Kumar',
      email: 'ravi@student.com',
      password: bcrypt.hashSync('student123', 10),
      role: 'student',
      hostelBlock: 'Block A',
      roomNumber: 'A-204',
      phone: '9000000002',
      createdAt: new Date().toISOString(),
    }
  ];
}

function getDefaultComplaints() {
  return [
    {
      id: 'cmp_demo_1',
      title: 'Water pressure low on 2nd floor bathroom',
      description: 'The tap and shower water pressure in the Block A 2nd floor bathroom has been very low since yesterday morning.',
      category: 'Plumbing',
      priority: 'high',
      location: 'Block A - 2nd Floor Bathroom',
      status: 'assigned',
      studentId: 'usr_student_default',
      assignedTo: 'Plumbing Team (Mr. Ramesh)',
      wardenNotes: 'Plumber Ramesh dispatched to inspect overhead water tank valve.',
      timeline: [
        {
          action: 'submitted',
          note: 'Complaint submitted by student.',
          by: 'Ravi Kumar',
          at: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          action: 'assigned',
          note: 'Plumber Ramesh dispatched to inspect overhead water tank valve.',
          by: 'Warden Admin',
          at: new Date(Date.now() - 3600000 * 2).toISOString(),
        }
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    }
  ];
}

function ensureDataFiles() {
  if (!memoryUsers) memoryUsers = getDefaultUsers();
  if (!memoryComplaints) memoryComplaints = getDefaultComplaints();

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(USERS_FILE)) {
      fs.writeFileSync(USERS_FILE, JSON.stringify(memoryUsers, null, 2));
    }
    if (!fs.existsSync(COMPLAINTS_FILE)) {
      fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(memoryComplaints, null, 2));
    }
  } catch (err) {
    console.warn('Filesystem access limited, operating in-memory:', err.message);
  }
}

function readUsers() {
  ensureDataFiles();
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
      if (Array.isArray(data) && data.length > 0) {
        memoryUsers = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Error reading users file:', err.message);
  }
  return memoryUsers;
}

function writeUsers(users) {
  memoryUsers = users;
  try {
    ensureDataFiles();
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.warn('Error writing users file:', err.message);
  }
}

function readComplaints() {
  ensureDataFiles();
  try {
    if (fs.existsSync(COMPLAINTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf8'));
      if (Array.isArray(data)) {
        memoryComplaints = data;
        return data;
      }
    }
  } catch (err) {
    console.warn('Error reading complaints file:', err.message);
  }
  return memoryComplaints;
}

function writeComplaints(complaints) {
  memoryComplaints = complaints;
  try {
    ensureDataFiles();
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
  } catch (err) {
    console.warn('Error writing complaints file:', err.message);
  }
}

module.exports = { readUsers, writeUsers, readComplaints, writeComplaints, ensureDataFiles };
