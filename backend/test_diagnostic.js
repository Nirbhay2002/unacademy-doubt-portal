const fs = require('fs');
async function test() {
    try {
        const loginRes = await fetch('http://127.0.0.1:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ rollNumber: '252006660', password: 'password123' })
        });
        const { token } = await loginRes.json();
        if (!token) { console.error('Login failed'); return; }
        console.log('Login OK');

        const formData = new FormData();
        formData.append('school', 'Test Diag School');
        formData.append('subject', 'Chemistry');

        const imagePath = 'C:\\Users\\Admin\\.gemini\\antigravity\\brain\\e9592b3a-b3a0-4248-9f32-227205745a3b\\verify_seed_data_1771776007588.webp';
        const fileBuffer = fs.readFileSync(imagePath);
        const blob = new Blob([fileBuffer], { type: 'image/webp' });
        formData.append('image', blob, 'diag_test.webp');

        const submitRes = await fetch('http://127.0.0.1:5000/api/doubts', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await submitRes.json();
        console.log('Status:', submitRes.status);
        if (submitRes.ok) console.log('SUCCESS - Cloudinary URL:', data.doubt?.imagePath);
        else console.error('FAILED:', data.error);
    } catch (err) { console.error('Error:', err.message); }
}
test();
