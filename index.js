const pg = require("pg");
const express = require("express");
const client = new pg.Client(
  process.env.DATABASE_URL || "postgres://localhost/the_acme_Ice_Cream_Shop_db"
);
const app = express();

app.use(require("morgan")("dev"));
app.use(express.json());

app.post("/api/notes", async (req, res, next) => {
  try {
    const SQL = `
      INSERT INTO flavors(name)
      VALUES ($1)
      RETURNING *
      `;
    const response = await client.query(SQL, [req.body.name]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

app.get("/api/notes", async (req, res, next) => {
  try {
    const SQL = `SELECT * from flavors;`;
    const response = await client.query(SQL);
    res.send(response.rows);
  } catch (error) {
    next(error);
  }
});

app.put("/api/notes/:id", async (req, res, next) => {
  try {
    const SQL = `
    UPDATE flavors
    SET name=$1, ranking=$2, updated_at= now()
    WHERE id=$3
    `;
    const response = await client.query(SQL, [
      req.body.name,
      req.body.ranking,
      req.params.id,
    ]);
    res.send(response.rows[0]);
  } catch (error) {
    next(error);
  }
});

//DELETE
app.delete("/api/notes/:id", async (req, res, next) => {
  try {
    const SQL = `
    DELETE from flavors
    WHERE id = $1
    `;
    const response = await client.query(SQL, [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log("connected to database");
  let SQL = /* sql */ `
  DROP TABLE IF EXISTS flavors;
  CREATE TABLE flavors(
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now()
  )
  `;
  await client.query(SQL);
  console.log("tables created");

  SQL = `
        INSERT INTO flavors (name, is_favorite, created_at, updated_at)
VALUES 
('Chocolate', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Vanilla', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Strawberry', false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('Mint Chocolate Chip', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
        `;
  await client.query(SQL);
  console.log("data seeded");

  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`listening on port ${port}`));
};
init();
