import { useState, useEffect } from 'react';

export function useProofOfWork(powChallenge) {
  const [status, setStatus] = useState('idle'); 
  const [nonce, setNonce] = useState(null);
  const [hash, setHash] = useState(null);
  const { challenge, difficulty, expiryTime: expiresAt = null } = powChallenge ? powChallenge : "";

  useEffect(() => {
    if (!challenge || !difficulty || !expiresAt) return;

    let isCancelled = false;
    let currentNonce = 0;
    const targetSuffix = '0'.repeat(difficulty);

    const startTime = Date.now();
    const timeout = expiresAt - Date.now() - 100; // e.g. 7 seconds max work

    setStatus('solving');

    const solve = async () => {
      while (!isCancelled && Date.now() < expiresAt && Date.now() - startTime < timeout) {
        const hash = await sha256(challenge + currentNonce);
        if (hash.endsWith(targetSuffix)) {
          setStatus('done');
          setNonce(currentNonce.toString());
          setHash(hash);
          return;
        }
        currentNonce++;
      }

      if (isCancelled) return;

      if (Date.now() > expiresAt) {
        setStatus('expired');
      } else {
        setStatus('timeout');
      }
    };

    solve();

    return () => {
      isCancelled = true;
    };
  }, [challenge, difficulty, expiresAt]);

  return { status, nonce, hash };
}

async function sha256(str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
