import { v7 as uuidv7 } from 'uuid';

const BASE_URL = 'http://localhost:3000/api/v1/auth';
const TEST_USER = {
    userName: 'Test User',
    userEmail: `test_${uuidv7()}@example.com`,
    userPassword: 'password123',
    userPhoneNumber: '1234567890'
};

async function runVerification() {
    console.log('🚀 Starting Auth Verification...');

    // 1. Signup
    console.log('\n1️⃣  Testing Signup...');
    const signupRes = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(TEST_USER)
    });
    const signupData = await signupRes.json();
    console.log(`Status: ${signupRes.status}`);
    if (!signupRes.ok) {
        console.error('Signup Failed:', signupData);
        return;
    }
    console.log('Signup Successful');

    // 2. Login
    console.log('\n2️⃣  Testing Login...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'PUT', // Note: Routes defined it as PUT for some reason? Checking auth.routes.ts... yes, it was PUT.
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: TEST_USER.userEmail, password: TEST_USER.userPassword })
    });
    const loginData = await loginRes.json();
    console.log(`Status: ${loginRes.status}`);
    if (!loginRes.ok) {
        console.error('Login Failed:', loginData);
        return;
    }

    const accessToken = loginData.data?.accessToken;
    const refreshToken = loginData.data?.refreshToken;

    if (!accessToken || !refreshToken) {
        console.error('Tokens missing in login response');
        return;
    }
    console.log('Login Successful. Tokens received.');

    // 3. Get Sessions (Protected)
    console.log('\n3️⃣  Testing Protected Route (Get Sessions)...');
    const sessionsRes = await fetch(`${BASE_URL}/sessions`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    console.log(`Status: ${sessionsRes.status}`);
    if (!sessionsRes.ok) {
        console.error('Get Sessions Failed:', await sessionsRes.json());
        return;
    }
    console.log('Access to Protected Route Successful');

    // 4. Refresh Token
    console.log('\n4️⃣  Testing Refresh Token...');
    // Note: In a real browser, this would be a cookie. Here we simulate passing it in body or header if supported by controller/middleware
    // The middleware checks cookies or Authorization: Refresh <token>
    const refreshRes = await fetch(`${BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Refresh ${refreshToken}`
        },
        body: JSON.stringify({ refreshToken }) // Some implementations might look in body too
    });
    const refreshData = await refreshRes.json();
    console.log(`Status: ${refreshRes.status}`);
    if (!refreshRes.ok) {
        console.error('Refresh Token Failed:', refreshData);
        return;
    }
    const newAccessToken = refreshData.data?.accessToken;
    console.log('Refresh Token Successful. New Access Token received.');

    // 5. Logout
    console.log('\n5️⃣  Testing Logout...');
    const logoutRes = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            // We need to pass the refresh token so it can be revoked. 
            // The controller expects it in req.refreshToken which comes from cookie or header
            'Cookie': `refreshToken=${refreshToken}` // simulating cookie if possible, or use header
        }
    });
    // Note: The middleware `tokenExtractor` looks for `Refresh ` header or cookie. 
    // But `logout` controller uses `req.refreshToken`.
    // Let's try sending it in header as well to be safe if cookie doesn't work in fetch without jar
    const logoutRes2 = await fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${newAccessToken}`,
            'Cookie': `refreshToken=${refreshToken}`
        }
    });

    console.log(`Status: ${logoutRes2.status}`);
    if (logoutRes2.status === 200) {
        console.log('Logout Successful');
    } else {
        console.log('Logout response:', await logoutRes2.json());
    }

    // 6. Verify Access Denied (using old token)
    console.log('\n6️⃣  Testing Access Denied after Logout...');
    // Actually, logout revokes the refresh token. The access token might still be valid until it expires (JWT).
    // So this test might pass (still accessible) unless we have a blacklist.
    // But we can test that the REFRESH token is no longer valid.

    const refreshRes2 = await fetch(`${BASE_URL}/refresh-token`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Refresh ${refreshToken}`
        }
    });
    console.log(`Status: ${refreshRes2.status} (Expected 401)`);
    if (refreshRes2.status === 401) {
        console.log('Refresh Token correctly rejected.');
    } else {
        console.error('Refresh Token still worked (unexpected)!');
    }
}

runVerification().catch(console.error);
