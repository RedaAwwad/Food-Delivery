
import { verifyAccessToken, verifyRefreshToken, generateAccessToken, generateRefreshToken } from "./generateAndVerifyToken";
import { UnauthorizedError, InternalServerError, BadRequestError } from "./errors/error-factories";
import { CustomError } from "./errors/custom-error";

const runTests = async () => {
    console.log("Running error handling verification tests...");
    let passed = 0;
    let failed = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`✅ PASS: ${message}`);
            passed++;
        } else {
            console.error(`❌ FAIL: ${message}`);
            failed++;
        }
    };

    const assertThrows = (fn: () => any, expectedErrorType: string, expectedMessage: string, checkErrorsInfo: boolean = false) => {
        try {
            fn();
            console.error(`❌ FAIL: Expected ${expectedErrorType} but no error was thrown`);
            failed++;
        } catch (error: any) {
            const isExpectedType = error instanceof CustomError && error.code === expectedErrorType;
            if (!isExpectedType) {
                console.error(`❌ FAIL: Expected ${expectedErrorType} but got ${error.code || error.name}`);
                if (error instanceof CustomError) console.log(error);
                failed++;
                return;
            }

            if (error.message !== expectedMessage) {
                console.error(`❌ FAIL: Expected message "${expectedMessage}" but got "${error.message}"`);
                failed++;
                return;
            }

            if (checkErrorsInfo) {
                if (!error.errors || error.errors.length === 0) {
                    console.error(`❌ FAIL: Expected errors array to be populated`);
                    failed++;
                    return;
                }
                console.log(`   Internal error detail: ${JSON.stringify(error.errors)}`);
            }

            console.log(`✅ PASS: [${expectedErrorType}] ${expectedMessage}`);
            passed++;
        }
    };

    // Test 1: verifyAccessToken - Missing token
    assertThrows(() => verifyAccessToken(""), "ERR_UNAUTHORIZED", "Access token is required");

    // Test 2: verifyAccessToken - Invalid token (malformed)
    assertThrows(() => verifyAccessToken("invalid.token.here"), "ERR_UNAUTHORIZED", "Invalid access token", true);

    // Test 3: verifyRefreshToken - Missing token
    assertThrows(() => verifyRefreshToken(""), "ERR_UNAUTHORIZED", "Refresh token is required");

    // Test 4: verifyRefreshToken - Invalid token (malformed)
    assertThrows(() => verifyRefreshToken("invalid.token.here"), "ERR_UNAUTHORIZED", "Invalid refresh token", true);


    console.log(`\nTests completed. Passed: ${passed}, Failed: ${failed}`);
    if (failed > 0) process.exit(1);
};

runTests();
