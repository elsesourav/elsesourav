const express = require('express');
const app = express();
app.use(express.json());
app.post('/test', (req, res) => {
  res.json({ ok: true, body: req.body });
});
app.use((err, req, res, next) => {
  res.status(400).json({ error: err.message });
});
app.listen(4009, () => {
  console.log("Listening on 4009");
});
