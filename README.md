
## Proof of Work (PoW) Sample

This project demonstrates a lightweight Proof of Work mechanism to protect backend APIs against abuse. Inspired by blockchain principles, it introduces computation cost to each client request during periods of high load or suspected abuse.


### How It Works

1. The backend issues a `challenge`, `difficulty`, and `signature`.
2. The client must find a `nonce` such that:

```
SHA256(challenge + nonce) ends with difficulty * "0"
```

3. Once found, the nonce and signature are submitted to the backend for verification.
4. The server performs a fast hash and HMAC validation to verify authenticity and correctness.


### Difficulty vs Solve Time

The difficulty determines the number of trailing zeros required in the hash. Solve time increases exponentially.

| Difficulty | Hash Condition         | Avg Attempts Required | Solve Time (on typical CPU) |
| ---------- | ---------------------- | --------------------- | --------------------------- |
| 3          | Ends with `000`        | \~1,000               | \~<1s                       |
| 4          | Ends with `0000`       | \~16,000              | \~1–3s                      |
| 5          | Ends with `00000`      | \~250,000             | \~15–25s                     |
| 6          | Ends with `000000`     | \~4,000,000           | \~5–10 min                   |
| 10         | Ends with `0000000000` | \~1 trillion+         | \~10+ days (impractical)    |

You can also extend the logic to require hashes that match both prefix and suffix patterns to make the problem harder or more diverse.


### Running the Project

**Backend**

```bash
cd backend
npm install
npm run dev
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

The frontend will request a PoW challenge when needed and solve it before retrying the protected action.


