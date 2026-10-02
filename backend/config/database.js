const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database/conectapet.db');
const sqlInitPath = path.resolve(__dirname, '../database/init.sql');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Erro ao conectar ao SQLite:', err.message);
  } else {
    console.log('⚡ Conectado com sucesso ao banco de dados SQLite.');
  }
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON;');
  if (fs.existsSync(sqlInitPath)) {
    const initSql = fs.readFileSync(sqlInitPath, 'utf-8');
    db.exec(initSql, (err) => {
      if (err) {
        console.error('❌ Erro no init.sql:', err.message);
      } else {
        console.log('✅ Tabelas do banco de dados inicializadas.');
      }
    });
  }
});

module.exports = db;
