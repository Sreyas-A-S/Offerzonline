import crypto from "crypto";

const CAPTCHA_SECRET = process.env.NEXTAUTH_SECRET || "offerz_captcha_key_2026";

export function generateCaptchaChallenge(): { question: string; token: string } {
  const num1 = Math.floor(Math.random() * 12) + 3; // 3 to 14
  const num2 = Math.floor(Math.random() * 8) + 1;  // 1 to 8
  const operations = ["+", "-", "x"];
  const op = operations[Math.floor(Math.random() * operations.length)];

  let answer = 0;
  if (op === "+") answer = num1 + num2;
  else if (op === "-") answer = num1 - num2;
  else if (op === "x") answer = num1 * num2;

  const timestamp = Date.now();
  const rawPayload = `${answer}:${timestamp}`;
  const signature = crypto.createHmac("sha256", CAPTCHA_SECRET).update(rawPayload).digest("hex");
  const token = Buffer.from(`${rawPayload}:${signature}`).toString("base64url");

  return {
    question: `What is ${num1} ${op} ${num2}?`,
    token,
  };
}

export function verifyCaptchaToken(userAnswer: string | number, token: string): { valid: boolean; reason?: string } {
  try {
    if (!token || userAnswer === undefined || userAnswer === null || String(userAnswer).trim() === "") {
      return { valid: false, reason: "Security captcha answer is required" };
    }

    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [expectedAnswer, timestampStr, signature] = decoded.split(":");

    if (!expectedAnswer || !timestampStr || !signature) {
      return { valid: false, reason: "Invalid captcha token" };
    }

    // Check expiry (captcha valid for 5 minutes)
    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp) || Date.now() - timestamp > 5 * 60 * 1000) {
      return { valid: false, reason: "Captcha expired. Please refresh and try again." };
    }

    // Verify cryptographic signature
    const expectedSignature = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(`${expectedAnswer}:${timestampStr}`)
      .digest("hex");

    if (signature !== expectedSignature) {
      return { valid: false, reason: "Invalid captcha signature" };
    }

    if (parseInt(String(userAnswer).trim(), 10) !== parseInt(expectedAnswer, 10)) {
      return { valid: false, reason: "Incorrect security captcha answer" };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: "Failed to verify security captcha" };
  }
}
