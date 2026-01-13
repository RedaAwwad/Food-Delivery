import {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    generateJwtTokenForGeneralUse,
    verifyJwtTokenForGeneralUse
} from './generateAndVerifyToken';

// Mock process.env
process.env.ACCESS_TOKEN_SECRET = 'test_access_secret';
process.env.REFRESH_TOKEN_SECRET = 'test_refresh_secret';
process.env.ACCESS_TOKEN_EXPIRY = '1m';
process.env.REFRESH_TOKEN_EXPIRY = '5m';

const runTests = async () => {
    console.log('--- Starting Token Refactor Verification ---');
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, msg: string) => {
        if (condition) {
            console.log(`✅ PASS: ${msg}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${msg}`);
            failed++;
        }
    };

    try {
        // Test 1: Generate and Verify Access Token
        console.log('\nTesting Access Token...');
        const payload = { userId: '123', role: 'user' };
        const accessToken = generateAccessToken(payload);
        assert(typeof accessToken === 'string', 'Access token should be a string');

        const decodedAccess = verifyAccessToken(accessToken);
        assert((decodedAccess as any).userId === '123', 'Access token payload matches');
        assert((decodedAccess as any).tokenType === 'access', 'Access token type is correct');

        // Test 2: Generate and Verify Refresh Token
        console.log('\nTesting Refresh Token...');
        const refreshToken = generateRefreshToken(payload);
        assert(typeof refreshToken === 'string', 'Refresh token should be a string');

        const decodedRefresh = verifyRefreshToken(refreshToken);
        assert((decodedRefresh as any).userId === '123', 'Refresh token payload matches');
        assert((decodedRefresh as any).tokenType === 'refresh', 'Refresh token type is correct');

        // Test 3: Cross Verification Failure (Access -> Refresh)
        console.log('\nTesting Invalid Verification (Cross-Token)...');
        try {
            verifyRefreshToken(accessToken);
            assert(false, 'Should fail verifying access token as refresh token'); // Should not reach here
        } catch (error: any) {
            // Depending on implementation, it might fail signature (different secret) or token type check
            // Since secrets are different, it should fail signature first usually, or if secrets same, fail token type.
            // With my mocks, secrets are different.
            assert(true, 'Correctly rejected access token when verifying as refresh token');
        }

        // Test 4: General Use Token
        console.log('\nTesting General Use...');
        const generalToken = generateJwtTokenForGeneralUse({ foo: 'bar' });
        const decodedGeneral = verifyJwtTokenForGeneralUse(generalToken);
        assert((decodedGeneral as any).foo === 'bar', 'General use token payload matches');

    } catch (err) {
        console.error('Unexpected error during tests:', err);
        failed++;
    }

    console.log(`\n--- Test Summary ---`);
    console.log(`Total: ${passed + failed}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) process.exit(1);
};

runTests();
