const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'complaints.json');

// Ensure data directory and files exist
function ensureDataFiles() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(USERS_FILE)) {
    // Seed with a default warden and a student
    const bcrypt = require('bcryptjs');
    const { v4: uuidv4 } = require('uuid');
    const defaultUsers = [
      {
        id: uuidv4(),
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
        id: uuidv4(),
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
    fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
  }
  if (!fs.existsSync(COMPLAINTS_FILE)) {
    fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify([], null, 2));
  }
}

function readUsers() {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function readComplaints() {
  ensureDataFiles();
  return JSON.parse(fs.readFileSync(COMPLAINTS_FILE, 'utf8'));
}

function writeComplaints(complaints) {
  fs.writeFileSync(COMPLAINTS_FILE, JSON.stringify(complaints, null, 2));
}

module.exports = { readUsers, writeUsers, readComplaints, writeComplaints, ensureDataFiles };
