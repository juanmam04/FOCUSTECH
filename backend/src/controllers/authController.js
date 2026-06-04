import { randomUUID } from 'crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import pool from '../config/db.js';
import { getSupabaseAdmin, isSupabaseAuthConfigured } from '../config/supabase.js';

function signToken(user) {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function register(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Ya existe una cuenta con ese email' });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
      [name.trim(), email.toLowerCase(), password_hash, 'customer']
    );

    const user = {
      id: result.insertId,
      name: name.trim(),
      email: email.toLowerCase(),
      role: 'customer',
    };

    const token = signToken(user);
    res.status(201).json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    if (users.length === 0) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Credenciales inválidas' });
    }

    const token = signToken(user);

    res.json({
      success: true,
      token,
      user: publicUser(user),
    });
  } catch (err) {
    next(err);
  }
}

export async function oauth(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    if (!isSupabaseAuthConfigured()) {
      return res.status(503).json({
        success: false,
        message: 'Inicio con Google no configurado en el servidor (falta SUPABASE_SERVICE_ROLE_KEY)',
      });
    }

    const { access_token: accessToken } = req.body;
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.auth.getUser(accessToken);

    if (error || !data?.user?.email) {
      return res.status(401).json({ success: false, message: 'Sesión de Google inválida o expirada' });
    }

    const sbUser = data.user;
    const email = sbUser.email.toLowerCase();
    const name =
      sbUser.user_metadata?.full_name
      || sbUser.user_metadata?.name
      || email.split('@')[0];

    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    let user;

    if (users.length > 0) {
      user = users[0];
      if (!user.name?.trim() && name) {
        await pool.query('UPDATE users SET name = ? WHERE id = ?', [name.trim(), user.id]);
        user.name = name.trim();
      }
    } else {
      const password_hash = await bcrypt.hash(randomUUID(), 10);
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [name.trim(), email, password_hash, 'customer']
      );
      user = {
        id: result.insertId,
        name: name.trim(),
        email,
        role: 'customer',
      };
    }

    const token = signToken(user);
    res.json({ success: true, token, user: publicUser(user) });
  } catch (err) {
    next(err);
  }
}

export async function me(req, res) {
  res.json({ success: true, user: req.user });
}
