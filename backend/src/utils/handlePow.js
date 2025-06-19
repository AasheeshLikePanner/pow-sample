import crypto from 'crypto'

const challengesMap = new Map();

function generateSecureRandomString(length = 16) {
    const str = crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length);
    return str;
}

function createHmacSignature(challenge, userId, ip, serverSecret) {
    const dataToSign = `${challenge}:${userId}:${ip}`;
    const hmac = crypto.createHmac('sha256', serverSecret);
    hmac.update(dataToSign);
    const signature = hmac.digest('hex');
    return signature;
}

function verifyHmacSignature(challenge, userId, userIp, receivedSignature, serverSecret) {
    const calculatedSignature = createHmacSignature(challenge, userId, userIp, serverSecret);
    const isValid = calculatedSignature === receivedSignature;
    return isValid;
}

function verifyHash(challenge, nonce, difficulty) {
    const hash = crypto.createHash('sha256').update(challenge + nonce).digest('hex');
    const target = '0'.repeat(difficulty);
    const isValid = hash.endsWith(target);
    return isValid;
}

export function issuePoWChallenge(userId, userIp) {
    const challenge = generateSecureRandomString();
    const expiryTime = Date.now() + (100 * 1000);
    const serverSecret = process.env.SERVER_SECRET;
    const difficulty = 4;
    const signature = createHmacSignature(challenge, userId, userIp, serverSecret);
    challengesMap.set(challenge, { expiryTime, difficulty });
    return {challenge, difficulty, expiryTime, signature};
}

export function verifyPowChallenge(userId, userIp, challenge, nonce, receivedSignature) {
    const serverSecret = process.env.SERVER_SECRET;
    const challengeData = challengesMap.get(challenge);

    if (!challengeData || challengeData.expiryTime < Date.now()) {
        return false;
    }
    const isRecivedSignature = verifyHmacSignature(challenge, userId, userIp, receivedSignature, serverSecret);
    if (!isRecivedSignature) {
        return false;
    }

    const validHash = verifyHash(challenge, nonce, challengeData.difficulty);
    if (!validHash) {
        return false;
    }
    challengesMap.delete(challenge);
    return true;
}

setInterval(() => {
    const now = Date.now();
    for(const [challenge, data] of challengesMap.entries() ){
        if (data.expiryTime < now) {
            challengesMap.delete(challenge);
        }
    }
}, 60 * 1000);