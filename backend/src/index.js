import express from 'express';
import { issuePoWChallenge, verifyPowChallenge } from './utils/handlePow.js';
import cors from 'cors'
import 'dotenv/config'

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*',
    methods: ["POST", "GET"],
    credentials: true,
}));

function generateRandomBoolean() {
    return Math.random() >= 0.5;
}

const verifiedUsersTokens = new Map();

app.post('/user-action', (req, res) => {
    const { userId } = req.body;
    const userIp = req.ip;
    const heavyTrafic = generateRandomBoolean(); // Simulating Real Traffic;

    if (heavyTrafic) {
        const expiryTime = verifiedUsersTokens.get(userId);

        if (expiryTime && expiryTime >= Date.now()) {
            return res.status(200).json({ message: "You can access this function" })
        }
        const powChallenge = issuePoWChallenge(userId, userIp);
        if (!powChallenge) {
            return res.status(500).json({ message: "Failed to issue PoW challenge. Server error." });
        }

        return res.status(403).json({
            message: "Access denied. Please solve the Proof-of-Work challenge to proceed.",
            challenge: powChallenge.challenge,
            difficulty: powChallenge.difficulty,
            expiryTime: powChallenge.expiryTime,
            signature: powChallenge.signature
        });
    } else {
        return res.status(200).json({ message: "You can access this function" })
    }
})

app.post('/verify-pow', (req, res) => {
    const { userId, challenge, nonce, signature } = req.body;
    const userIp = req.ip;

    if ([userId, challenge, nonce, signature].some(t => t.trim() === "")) {
        return res.status(400).json({ message: "Missing required parameters (userId, challenge, nonce, signature)." });
    }
    const isValid = verifyPowChallenge(userId, userIp, challenge, nonce, signature);

    if (isValid) {
        const expiryTime = Date.now() + (5 * 60 * 1000);
        verifiedUsersTokens.set(userId, expiryTime)
        return res.status(200).json({ message: "Proof-of-Work successfully verified! You can now proceed with your action." });
    } else {
        return res.status(403).json({ message: "Proof-of-Work verification failed. Please try again." });
    }
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});