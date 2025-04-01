const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const cors = require('cors');

const app = express();
const upload = multer();
app.use(cors());

app.post('/extrair-vencimento', upload.any(), async (req, res) => {
  try {
    const file = req.files.find(f => f.fieldname === 'pdf');
    if (!file) return res.status(400).json({ error: 'Arquivo não encontrado no campo "pdf"' });

    const data = await pdfParse(file.buffer);
    const texto = data.text;

    const match = texto.match(/(\d{2})\/(\d{2})\/(\d{4})/);
    if (!match) return res.status(404).json({ error: 'Data de vencimento não encontrada' });

    const [_, dia, mes, ano] = match;
    const vencimentoISO = `${ano}-${mes}-${dia}T00:00:00Z`;

    return res.json({
      vencimento_br: `${dia}/${mes}/${ano}`,
      vencimento_iso: vencimentoISO
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});