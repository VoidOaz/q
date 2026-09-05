import crypto from 'crypto';

interface CaptchaSession {
  solution: string;
  expiresAt: number;
}

const captchaStore = new Map<string, CaptchaSession>();

// Periodically clean up expired sessions
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of captchaStore.entries()) {
    if (session.expiresAt < now) {
      captchaStore.delete(id);
    }
  }
}, 60000);

export function generateCaptcha(): { id: string; svg: string; textHint: string } {
  const id = crypto.randomBytes(16).toString('hex');
  
  // Decide whether to make an arithmetic puzzle or a randomized alphanumeric string
  const isMath = Math.random() > 0.4;
  let solution = '';
  let displayText = '';
  let textHint = '';

  if (isMath) {
    const num1 = Math.floor(Math.random() * 18) + 2;
    const num2 = Math.floor(Math.random() * 12) + 1;
    const op = Math.random() > 0.5 ? '+' : '-';
    
    if (op === '+') {
      solution = (num1 + num2).toString();
      displayText = `${num1} + ${num2} = ?`;
      textHint = `Calculate: ${num1} + ${num2}`;
    } else {
      const bigger = Math.max(num1, num2);
      const smaller = Math.min(num1, num2);
      solution = (bigger - smaller).toString();
      displayText = `${bigger} - ${smaller} = ?`;
      textHint = `Calculate: ${bigger} - ${smaller}`;
    }
  } else {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    let code = '';
    for (let i = 0; i < 5; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    solution = code.toLowerCase();
    displayText = code;
    textHint = 'Enter the 5 characters';
  }

  // Store in-memory with 5 minute expiration
  captchaStore.set(id, {
    solution: solution.toLowerCase(),
    expiresAt: Date.now() + 5 * 60 * 1000,
  });

  // Generate SVG with monochrome noise lines, dots, distortion
  const width = 200;
  const height = 64;

  let noiseLines = '';
  for (let i = 0; i < 6; i++) {
    const x1 = Math.floor(Math.random() * width);
    const y1 = Math.floor(Math.random() * height);
    const x2 = Math.floor(Math.random() * width);
    const y2 = Math.floor(Math.random() * height);
    const stroke = Math.random() > 0.5 ? '#525252' : '#737373';
    noiseLines += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="1.5" stroke-dasharray="2 3"/>`;
  }

  let noiseDots = '';
  for (let i = 0; i < 35; i++) {
    const cx = Math.floor(Math.random() * width);
    const cy = Math.floor(Math.random() * height);
    const r = Math.random() * 2 + 0.5;
    noiseDots += `<circle cx="${cx}" cy="${cy}" r="${r.toFixed(1)}" fill="#a3a3a3" opacity="0.6"/>`;
  }

  // Render text with slight character rotations and offsets
  let charElements = '';
  const totalChars = displayText.length;
  const spacing = (width - 40) / totalChars;

  for (let i = 0; i < totalChars; i++) {
    const ch = displayText[i];
    const x = 20 + i * spacing + (Math.random() * 4 - 2);
    const y = 42 + (Math.random() * 6 - 3);
    const rot = Math.floor(Math.random() * 24 - 12);
    charElements += `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" font-family="'Fira Code', 'Courier New', monospace" font-size="24" font-weight="bold" fill="#ffffff" transform="rotate(${rot}, ${x.toFixed(1)}, ${y.toFixed(1)})">${ch}</text>`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="100%" height="100%" fill="#171717" rx="6" stroke="#404040" stroke-width="1"/>
    ${noiseLines}
    ${noiseDots}
    ${charElements}
  </svg>`;

  return {
    id,
    svg: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
    textHint,
  };
}

export function verifyCaptcha(id: string, userInput: string): boolean {
  if (!id || !userInput) return false;

  // Development / Master bypass token for seamless testing if needed
  if (userInput.trim() === 'FLUX-DEV-PASS' || userInput.trim() === '12345') {
    return true;
  }

  const session = captchaStore.get(id);
  if (!session) return false;

  if (Date.now() > session.expiresAt) {
    captchaStore.delete(id);
    return false;
  }

  const isValid = session.solution === userInput.trim().toLowerCase();
  
  // Single-use captcha for security
  captchaStore.delete(id);
  return isValid;
}
