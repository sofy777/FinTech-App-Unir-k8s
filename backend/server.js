const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3001;

// ✅ CORS CONFIGURADO CORRECTAMENTE
app.use(cors({
  origin: '*', // en producción puedes poner tu frontend ELB
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

// ✅ IMPORTANTE: manejar preflight (esto te faltaba)
app.options('*', cors());

app.use(express.json());

// ✅ PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'db-service', // ✅ usar nombre del service
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'fintech_db',
  user: process.env.DB_USER || 'fintech_user',
  password: process.env.DB_PASSWORD || 'fintech_pass123'
});

// ✅ Inicializar DB
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        saldo DECIMAL(12, 2) DEFAULT 0.00,
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS transacciones (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER REFERENCES usuarios(id),
        tipo VARCHAR(20) NOT NULL,
        monto DECIMAL(12, 2) NOT NULL,
        descripcion TEXT,
        fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Base de datos inicializada correctamente');
  } catch (error) {
    console.error('❌ Error al inicializar la base de datos:', error);
  }
};

// ✅ Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'FinTech Solutions API está funcionando' });
});

// ✅ Obtener usuarios
app.get('/api/usuarios', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Crear usuario
app.post('/api/usuarios', async (req, res) => {
  const { nombre, email, saldo } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, saldo) VALUES ($1, $2, $3) RETURNING *',
      [nombre, email, saldo || 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('❌ Error creando usuario:', error); // ✅ extra log
    res.status(500).json({ error: error.message });
  }
});

// ✅ Obtener usuario
app.get('/api/usuarios/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Transacciones por usuario
app.get('/api/usuarios/:id/transacciones', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transacciones WHERE usuario_id = $1 ORDER BY fecha DESC',
      [req.params.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ✅ Crear transacción
app.post('/api/transacciones', async (req, res) => {
  const { usuario_id, tipo, monto, descripcion } = req.body;
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const transaccion = await client.query(
      'INSERT INTO transacciones (usuario_id, tipo, monto, descripcion) VALUES ($1, $2, $3, $4) RETURNING *',
      [usuario_id, tipo, monto, descripcion]
    );
    
    const operacion = tipo === 'ingreso' ? '+' : '-';
    await client.query(
      `UPDATE usuarios SET saldo = saldo ${operacion} $1 WHERE id = $2`,
      [monto, usuario_id]
    );
    
    await client.query('COMMIT');
    res.status(201).json(transaccion.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en transacción:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// ✅ Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend ejecutándose en puerto ${PORT}`);
  await initDB();
});
