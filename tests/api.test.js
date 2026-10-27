// Simple integration tests to verify API behavior
const http = require('http');

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: JSON.parse(data) }));
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  const BASE = { hostname: 'localhost', port: 5000, headers: { 'Content-Type': 'application/json' } };
  let passed = 0, failed = 0;

  const check = (label, condition) => {
    if (condition) { console.log(`  ✅ ${label}`); passed++; }
    else { console.log(`  ❌ ${label}`); failed++; }
  };

  console.log('\n🧪 Hostel Complaint Portal — API Tests\n');

  // Test 1: Health check
  console.log('📡 Health Check');
  const health = await request({ ...BASE, path: '/api/health', method: 'GET' });
  check('Server responds 200', health.status === 200);
  check('Status is ok', health.body.status === 'ok');

  // Test 2: Invalid login
  console.log('\n🔐 Authentication');
  const badLogin = await request({ ...BASE, path: '/api/auth/login', method: 'POST' }, { email: 'nobody@x.com', password: 'wrong' });
  check('Invalid credentials return 401', badLogin.status === 401);

  // Test 3: Valid warden login
  const wardenLogin = await request({ ...BASE, path: '/api/auth/login', method: 'POST' }, { email: 'warden@hostel.com', password: 'warden123' });
  check('Warden login returns 200', wardenLogin.status === 200);
  check('Token is returned', !!wardenLogin.body.token);
  check('Role is warden', wardenLogin.body.user.role === 'warden');

  // Test 4: Valid student login
  const studentLogin = await request({ ...BASE, path: '/api/auth/login', method: 'POST' }, { email: 'ravi@student.com', password: 'student123' });
  check('Student login returns 200', studentLogin.status === 200);
  const studentToken = studentLogin.body.token;

  // Test 5: Unauthenticated access
  console.log('\n🛡️ Authorization');
  const noAuth = await request({ ...BASE, path: '/api/complaints', method: 'GET' });
  check('No token returns 401', noAuth.status === 401);

  // Test 6: Student can see own complaints
  const authBase = { ...BASE, headers: { ...BASE.headers, Authorization: `Bearer ${studentToken}` } };
  const myComplaints = await request({ ...authBase, path: '/api/complaints', method: 'GET' });
  check('Authenticated student can fetch complaints', myComplaints.status === 200);
  check('Response is an array', Array.isArray(myComplaints.body));

  // Test 7: Invalid complaint submission
  console.log('\n📝 Complaint Validation');
  const badComplaint = await request({ ...authBase, path: '/api/complaints', method: 'POST' }, { title: 'Hi', description: 'Short', category: 'Plumbing' });
  check('Short title returns 400', badComplaint.status === 400);

  // Test 8: Invalid category
  const badCat = await request({ ...authBase, path: '/api/complaints', method: 'POST' }, { title: 'Valid title here', description: 'This is a valid description text', category: 'FakeCategory' });
  check('Invalid category returns 400', badCat.status === 400);

  // Test 9: Valid complaint
  const goodComplaint = await request(
    { ...authBase, path: '/api/complaints', method: 'POST' },
    { title: 'Leaking pipe in block B', description: 'The water pipe near the common bathroom is leaking since yesterday', category: 'Plumbing', priority: 'high' }
  );
  check('Valid complaint returns 201', goodComplaint.status === 201);
  check('Status is pending', goodComplaint.body.status === 'pending');
  check('Timeline has 1 entry', goodComplaint.body.timeline?.length === 1);
  const complaintId = goodComplaint.body.id;

  // Test 10: Warden cannot submit complaint
  console.log('\n🚫 Role Enforcement');
  const wardenToken = wardenLogin.body.token;
  const wardenAuthBase = { ...BASE, headers: { ...BASE.headers, Authorization: `Bearer ${wardenToken}` } };
  const wardenSubmit = await request({ ...wardenAuthBase, path: '/api/complaints', method: 'POST' }, { title: 'Warden complaint', description: 'Should not work at all', category: 'Electrical' });
  check('Warden cannot submit complaints (403)', wardenSubmit.status === 403);

  // Test 11: Student cannot update status
  const studentUpdate = await request({ ...authBase, path: `/api/complaints/${complaintId}/status`, method: 'PATCH' }, { status: 'resolved' });
  check('Student cannot update status (403)', studentUpdate.status === 403);

  // Test 12: Warden can update status
  const wardenUpdate = await request({ ...wardenAuthBase, path: `/api/complaints/${complaintId}/status`, method: 'PATCH' }, { status: 'assigned', wardenNotes: 'Sent maintenance team', assignedTo: 'Maintenance Team' });
  check('Warden can update status (200)', wardenUpdate.status === 200);
  check('Status updated to assigned', wardenUpdate.body.status === 'assigned');
  check('Timeline now has 2 entries', wardenUpdate.body.timeline?.length === 2);

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch(e => { console.error(e); process.exit(1); });
