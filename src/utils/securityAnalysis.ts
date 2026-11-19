/**
 * VAULTFORGE — Security Analysis & Password Health Engine
 * Evaluates real decrypted credentials locally without any network leakage
 */

import type { DecryptedRecord, HealthIssue, VaultAnalytics } from '../types/vault';

export function calculatePasswordEntropy(password: string): number {
  if (!password) return 0;

  let poolSize = 0;
  if (/[a-z]/.test(password)) poolSize += 26;
  if (/[A-Z]/.test(password)) poolSize += 26;
  if (/[0-9]/.test(password)) poolSize += 10;
  if (/[^a-zA-Z0-9]/.test(password)) poolSize += 32;

  if (poolSize === 0) return 0;
  // Entropy = length * log2(poolSize)
  const entropy = password.length * (Math.log(poolSize) / Math.LN2);
  return Math.round(entropy * 10) / 10;
}

export function evaluatePasswordQuality(password: string): {
  strength: 'WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'EXCELLENT';
  score: number; // 0 to 4
  reasons: string[];
} {
  const reasons: string[] = [];
  if (!password) {
    return { strength: 'WEAK', score: 0, reasons: ['Password cannot be empty'] };
  }

  let score = 0;
  const len = password.length;

  if (len < 8) {
    reasons.push('Length is under 8 characters (highly vulnerable to brute force)');
  } else if (len >= 14) {
    score += 2;
  } else if (len >= 10) {
    score += 1;
  }

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  else reasons.push('Lacks mixed uppercase and lowercase characters');

  if (/[0-9]/.test(password)) score += 1;
  else reasons.push('Lacks numeric digits');

  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else reasons.push('Lacks special symbols');

  // Check common patterns
  if (/^[0-9]+$/.test(password)) {
    score = Math.min(score, 1);
    reasons.push('Contains only numbers');
  }
  if (/^[a-zA-Z]+$/.test(password)) {
    score = Math.min(score, 1);
    reasons.push('Contains only alphabet characters');
  }
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
    reasons.push('Contains repetitive consecutive characters');
  }

  const commonWords = ['password', 'admin', '123456', 'welcome', 'qwerty', 'letmein'];
  for (const w of commonWords) {
    if (password.toLowerCase().includes(w)) {
      score = 0;
      reasons.push(`Contains common dictionary term "${w}"`);
      break;
    }
  }

  const strengthMap: ('WEAK' | 'FAIR' | 'GOOD' | 'STRONG' | 'EXCELLENT')[] = [
    'WEAK',
    'WEAK',
    'FAIR',
    'GOOD',
    'STRONG'
  ];

  const finalStrength = score >= 4 && len >= 16 ? 'EXCELLENT' : strengthMap[Math.min(4, Math.max(0, score))];

  return {
    strength: finalStrength,
    score: Math.min(4, Math.max(0, score)),
    reasons
  };
}

export function analyzeVaultHealth(
  records: DecryptedRecord[],
  passwordAgeThresholdDays = 90
): VaultAnalytics {
  const activeRecords = records.filter((r) => !r.isDeleted);
  const issues: HealthIssue[] = [];

  let loginCount = 0;
  let noteCount = 0;
  let cardCount = 0;
  let apiKeyCount = 0;

  const passwordMap = new Map<string, string[]>(); // password -> list of record titles
  const now = Date.now();
  const maxAgeMs = passwordAgeThresholdDays * 24 * 60 * 60 * 1000;

  let strongPasswords = 0;
  let weakPasswords = 0;
  let oldPasswords = 0;

  for (const record of activeRecords) {
    if (record.type === 'login') {
      loginCount++;
      const pwd = record.password;

      // Track password reuse
      if (pwd) {
        const existing = passwordMap.get(pwd) || [];
        existing.push(record.title);
        passwordMap.set(pwd, existing);

        // Quality check
        const { strength, reasons } = evaluatePasswordQuality(pwd);
        if (strength === 'WEAK' || strength === 'FAIR') {
          weakPasswords++;
          issues.push({
            id: `issue_weak_${record.id}`,
            recordId: record.id,
            recordTitle: record.title,
            type: pwd.length < 8 ? 'SHORT' : 'WEAK',
            severity: 'HIGH',
            title: `Weak Password on "${record.title}"`,
            description: reasons.join('; ') || 'Password lacks sufficient entropy.',
            recommendation: 'Generate a 20+ character random password using the C engine.'
          });
        } else {
          strongPasswords++;
        }

        // Age check
        if (now - record.updatedAt > maxAgeMs) {
          oldPasswords++;
          const daysOld = Math.floor((now - record.updatedAt) / (24 * 60 * 60 * 1000));
          issues.push({
            id: `issue_old_${record.id}`,
            recordId: record.id,
            recordTitle: record.title,
            type: 'OLD',
            severity: 'LOW',
            title: `Password has not been rotated in ${daysOld} days`,
            description: `Last updated ${new Date(record.updatedAt).toLocaleDateString()}. Periodic rotation minimizes exposure risks.`,
            recommendation: 'Consider rotating this password if associated with a critical service.'
          });
        }
      } else {
        issues.push({
          id: `issue_missing_${record.id}`,
          recordId: record.id,
          recordTitle: record.title,
          type: 'MISSING_DATA',
          severity: 'MEDIUM',
          title: `Missing Password on "${record.title}"`,
          description: 'Login entry exists without a saved password.',
          recommendation: 'Add or generate a secure password.'
        });
      }
    } else if (record.type === 'note') {
      noteCount++;
    } else if (record.type === 'card') {
      cardCount++;
    } else if (record.type === 'api_key') {
      apiKeyCount++;
    }
  }

  // Detect reuse
  let reusedPasswords = 0;
  passwordMap.forEach((titles, pwd) => {
    if (titles.length > 1) {
      reusedPasswords += titles.length;
      issues.push({
        id: `issue_reuse_${pwd.slice(0, 4)}_${titles.length}`,
        recordId: 'multiple',
        recordTitle: titles.join(', '),
        type: 'REUSED',
        severity: 'HIGH',
        title: `Reused Password across ${titles.length} credentials`,
        description: `Shared between: ${titles.slice(0, 3).join(', ')}${titles.length > 3 ? ` and ${titles.length - 3} more` : ''}. A compromise of one exposes all.`,
        recommendation: 'Generate distinct unique credentials for each service.'
      });
    }
  });

  // Calculate Security Score (0 to 100)
  let calculatedScore = 100;
  if (activeRecords.length === 0) {
    calculatedScore = 100; // Fresh empty vault
  } else {
    calculatedScore -= weakPasswords * 15;
    calculatedScore -= reusedPasswords * 12;
    calculatedScore -= oldPasswords * 4;
    calculatedScore = Math.max(10, Math.min(100, calculatedScore));
  }

  return {
    totalRecords: activeRecords.length,
    loginCount,
    noteCount,
    cardCount,
    apiKeyCount,
    strongPasswords,
    weakPasswords,
    reusedPasswords,
    oldPasswords,
    securityScore: calculatedScore,
    issues: issues.sort((a, b) => (a.severity === 'HIGH' ? -1 : 1))
  };
}
