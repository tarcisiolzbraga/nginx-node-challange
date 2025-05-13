const express = require('express');
const mysql = require('mysql');
const app = express();
const port = 3000;

// Configura a conexão com o banco de dados
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.query(`
  CREATE TABLE IF NOT EXISTS people (
    id INT NOT NULL AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    PRIMARY KEY (id)
  );
`, err => {
  if (err) {
    console.error('Erro ao criar tabela:', err);
  } else {
    console.log('Tabela "people" verificada/criada com sucesso.');
  }
});

// Middleware para entender dados de formulário
app.use(express.urlencoded({ extended: true }));

// Rota para exibir o formulário
app.get('/', (req, res) => {
  res.send(`
    <h1>Adicione seu nome</h1>
    <form method="POST" action="/add-name">
      <input type="text" name="name" placeholder="Digite seu nome" required />
      <button type="submit">Adicionar</button>
    </form>
  `);
});

// Rota para adicionar nome
app.post('/add-name', (req, res) => {
  const name = req.body.name;  // Obtém o nome do formulário

  // Insere o nome no banco de dados
  db.query('INSERT INTO people (name) VALUES (?)', [name], (err, results) => {
    if (err) {
      return res.status(500).send('Error inserting name');
    }

    // Retorna a lista de nomes cadastrados
    db.query('SELECT * FROM people', (err, results) => {
      if (err) {
        return res.status(500).send('Error retrieving names');
      }
      let namesList = results.map(row => row.name).join('<br>');
      res.send(`
        <h1>Full Cycle Rocks!</h1>
        <p>Nome adicionado: ${name}</p>
        <h2>Lista de Nomes:</h2>
        ${namesList}
        <br><br>
        <a href="/">Adicionar outro nome</a>
      `);
    });
  });
});

// Iniciar o servidor na porta 3000
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
