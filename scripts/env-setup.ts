import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// Load .env.local if it exists
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
    console.log(`Loading environment from ${envLocalPath}`);
    dotenv.config({ path: envLocalPath });
} else {
    // Fallback to .env
    const envPath = path.resolve(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
        console.log(`Loading environment from ${envPath}`);
        dotenv.config({ path: envPath });
    } else {
        console.warn("No .env.local or .env file found.");
    }
}
