import bcrypt from 'bcrypt';

const hash = '$2b$10$R09YAgyKcmatMaTpJ0SHd.8lxA/TyoOP/eQEepulSkLQ2lDbPz5CS'; // Pedrito's hash
const passwordsToTry = ['Pedrito123!', 'pedrito123!', 'Pedrito123', 'Password123!', 'FitFlow2024!'];

async function test() {
    console.log("Testing hash:", hash);
    for (const pw of passwordsToTry) {
        const match = await bcrypt.compare(pw, hash);
        console.log(`Password: ${pw} -> Match: ${match}`);
    }
}

test();
