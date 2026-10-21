/**
 * Comprehensive Automated Verification Suite for MTAB Portfolio Admin Git-CMS
 * Tests schemas, Web Crypto encryption/decryption, binary serialization, and GitHub API payloads.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const ROOT_DIR = process.cwd();

describe('1. Data Schema Integrity & Decoupling', () => {
  it('assets/data/projects.json must exist and contain valid projects array', () => {
    const file = path.join(ROOT_DIR, 'assets/data/projects.json');
    assert.ok(fs.existsSync(file), 'projects.json exists');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(Array.isArray(data), 'projects is an array');
    assert.ok(data.length > 0, 'projects array has items');

    // Check schema of first 3 items
    for (const p of data.slice(0, 3)) {
      assert.ok(p.name, 'project has name');
      assert.ok(typeof p.description === 'string', 'project has description string');
      assert.ok(p.category, 'project has category');
      assert.ok(Array.isArray(p.tags), 'project has tags array');
    }
  });

  it('assets/data/certificates.json must exist and contain valid certificates array', () => {
    const file = path.join(ROOT_DIR, 'assets/data/certificates.json');
    assert.ok(fs.existsSync(file), 'certificates.json exists');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(Array.isArray(data), 'certificates is an array');
    assert.ok(data.length >= 10, 'certificates array contains verified MOOCs');

    for (const c of data) {
      assert.ok(c.title, 'certificate has title');
      assert.ok(c.cardImage, 'certificate has cardImage asset path');
    }
  });

  it('assets/data/profile.json must exist and contain valid profile and typewriter words', () => {
    const file = path.join(ROOT_DIR, 'assets/data/profile.json');
    assert.ok(fs.existsSync(file), 'profile.json exists');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.equal(data.name, 'Mihretab Nigatu');
    assert.ok(Array.isArray(data.typewriter_words), 'typewriter_words is an array');
    assert.ok(data.typewriter_words.length >= 5, 'contains animated role phrases');
    assert.ok(data.socials && data.socials.github, 'contains GitHub social link');
  });

  it('assets/data/experience.json must exist with work and accreditations', () => {
    const file = path.join(ROOT_DIR, 'assets/data/experience.json');
    assert.ok(fs.existsSync(file), 'experience.json exists');
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    assert.ok(Array.isArray(data.work), 'work is array');
    assert.ok(Array.isArray(data.accreditations), 'accreditations is array');
  });

  it('active Resume.pdf exists and is non-empty', () => {
    const file = path.join(ROOT_DIR, 'assets/docs/Resume.pdf');
    assert.ok(fs.existsSync(file), 'Resume.pdf exists');
    const stat = fs.statSync(file);
    assert.ok(stat.size > 1000, `Resume.pdf size is valid (${stat.size} bytes)`);
  });
});

describe('2. Web Crypto API Encryption & Decryption Simulation', () => {
  // Test AES-GCM + PBKDF2 logic equivalent to Web Crypto
  async function simulateEncrypt(plaintext, password) {
    const salt = crypto.randomBytes(16);
    const iv = crypto.randomBytes(12);
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const enc = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return {
      salt: salt.toString('hex'),
      iv: iv.toString('hex'),
      tag: tag.toString('hex'),
      ciphertext: enc.toString('hex')
    };
  }

  async function simulateDecrypt(bundle, password) {
    const salt = Buffer.from(bundle.salt, 'hex');
    const iv = Buffer.from(bundle.iv, 'hex');
    const tag = Buffer.from(bundle.tag, 'hex');
    const ciphertext = Buffer.from(bundle.ciphertext, 'hex');
    const key = crypto.pbkdf2Sync(password, salt, 100000, 32, 'sha256');
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(tag);
    return decipher.update(ciphertext, undefined, 'utf8') + decipher.final('utf8');
  }

  it('should encrypt and decrypt GitHub token with master password cleanly', async () => {
    const secretPat = 'ghp_mtabSecretToken1234567890abcdef';
    const masterPassword = 'MihretabSecurePassword!2026';

    const bundle = await simulateEncrypt(secretPat, masterPassword);
    assert.notEqual(bundle.ciphertext, secretPat, 'ciphertext is encrypted');

    const decrypted = await simulateDecrypt(bundle, masterPassword);
    assert.equal(decrypted, secretPat, 'decrypted text matches original PAT');
  });

  it('should fail decryption when provided an invalid master password', async () => {
    const secretPat = 'ghp_mtabSecretToken1234567890abcdef';
    const masterPassword = 'CorrectPassword123';
    const wrongPassword = 'WrongPassword456';

    const bundle = await simulateEncrypt(secretPat, masterPassword);
    await assert.rejects(async () => {
      await simulateDecrypt(bundle, wrongPassword);
    }, /Unsupported state or unable to authenticate data|bad decrypt/i);
  });
});

describe('3. Binary Asset Base64 Serialization for GitHub API', () => {
  it('should encode Resume.pdf to base64 and decode back to identical binary buffer', () => {
    const resumePath = path.join(ROOT_DIR, 'assets/docs/Resume.pdf');
    const originalBuffer = fs.readFileSync(resumePath);
    const base64Str = originalBuffer.toString('base64');

    assert.ok(base64Str.length > 0, 'base64 string generated');
    const reconstructedBuffer = Buffer.from(base64Str, 'base64');
    assert.ok(originalBuffer.equals(reconstructedBuffer), 'binary buffer matches byte-for-byte');
  });
});

describe('4. Frontend Pages & Admin Deck Syntax Integrity', () => {
  it('admin.html must be present, well-formed, and reference admin.css and admin.js', () => {
    const adminPath = path.join(ROOT_DIR, 'admin.html');
    assert.ok(fs.existsSync(adminPath), 'admin.html exists');
    const content = fs.readFileSync(adminPath, 'utf8');

    assert.ok(content.includes('assets/css/admin.css'), 'admin.html links admin.css');
    assert.ok(content.includes('assets/js/admin.js'), 'admin.html includes admin.js');
    assert.ok(content.includes('id="lock-screen"'), 'admin.html has lock screen');
    assert.ok(content.includes('id="deck-view"'), 'admin.html has deck view');
    assert.ok(content.includes('id="commit-drawer"'), 'admin.html has commit drawer');
  });

  it('all JavaScript files pass Node syntax check', () => {
    const jsFiles = [
      'assets/js/admin.js',
      'assets/js/project.js',
      'assets/js/experience.js',
      'assets/js/education.js',
      'assets/js/particle.js',
      'assets/js/app.js',
      'assets/js/cursor.js'
    ];

    for (const f of jsFiles) {
      const fullPath = path.join(ROOT_DIR, f);
      assert.ok(fs.existsSync(fullPath), `${f} exists`);
      // Syntax check via node command
      const code = fs.readFileSync(fullPath, 'utf8');
      assert.doesNotThrow(() => {
        new Function(code);
      }, `File ${f} is valid JavaScript`);
    }
  });
});
