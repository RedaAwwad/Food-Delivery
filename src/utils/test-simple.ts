console.log('Test script starting...');
import { generateAccessToken } from './generateAndVerifyToken';
console.log('Import successful');
try {
    const token = generateAccessToken({ userId: '1', role: 'admin' });
    console.log('Token generated:', token);
} catch (e) {
    console.error('Error:', e);
}
