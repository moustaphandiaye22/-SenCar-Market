const BASE_URL = 'http://127.0.0.1:8082/api/auth';
const TEST_EMAIL = `test_${Date.now()}@example.com`;
const TEST_PHONE = `+221${Math.floor(1000000 + Math.random() * 9000000)}`;
const TEST_PASSWORD = 'Password123!';
let authToken = '';

async function makeRequest(endpoint, method, body, headers = {}) {
    console.log(`\n================================`);
    console.log(`[${method}] ${endpoint}`);
    if (body) console.log(`Payload: ${JSON.stringify(body)}`);
    
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            ...headers
        }
    };
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const res = await fetch(`${BASE_URL}${endpoint}`, options);
    let data;
    const text = await res.text();
    data = text;
    try {
        data = JSON.parse(text);
    } catch(e) {}
    console.log(`Status: ${res.status}`);
    console.log(`Response:`, data);
    return { status: res.status, data };
}

async function runTests() {
    try {
        // 1. Register User
        console.log("-> Testing Registration...");
        const registerRes = await makeRequest('/register', 'POST', {
            email: TEST_EMAIL,
            motDePasse: TEST_PASSWORD,
            nom: 'Doe',
            prenom: 'Jane',
            typeUtilisateur: 'UTILISATEUR',
            telephone: TEST_PHONE
        });

        // 2. Login User
        console.log("-> Testing Login...");
        const loginRes = await makeRequest('/login', 'POST', {
            identifiant: TEST_EMAIL,
            motDePasse: TEST_PASSWORD
        });

        if (loginRes.data.accessToken) {
            authToken = loginRes.data.accessToken;
            
            // 3. Get Me
            console.log("-> Testing Get Profile...");
            await makeRequest('/me', 'GET', null, {
                'Authorization': `Bearer ${authToken}`
            });

            // 4. Update Profile
            console.log("-> Testing Update Profile...");
            await makeRequest('/profile', 'PUT', {
                prenom: 'Jane Updated'
            }, {
                'Authorization': `Bearer ${authToken}`
            });
            
            // 5. Change Password
            console.log("-> Testing Change Password...");
            await makeRequest('/change-password', 'POST', {
                motDePasseActuel: TEST_PASSWORD,
                nouveauMotDePasse: 'NewPassword123!'
            }, {
                'Authorization': `Bearer ${authToken}`
            });

        } else if (loginRes.status === 403) {
            console.log("=> L'utilisateur n'est pas vérifié. Tentative de renvoi d'OTP...");
            
            // Resend OTP
            await makeRequest('/resend-otp', 'POST', {
                email: TEST_EMAIL
            });
        }

        // 6. Check Forgot Password
        console.log("-> Testing Forgot Password...");
        await makeRequest('/forgot-password', 'POST', {
            email: TEST_EMAIL
        });

    } catch (err) {
        console.error('Test failed:', err);
    }
}

runTests();
