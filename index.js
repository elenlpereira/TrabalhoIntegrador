// Servidor Express mínimo
const app = require('./src/app');

// Define a porta usa variável de ambiente ou 3000 como fallback
const PORTA = process.env.PORT || 3000;

// Inicia o servidor na porta especificada
app.listen(PORTA, () => {
    console.log("Servidor rodando em http://localhost:" + PORTA);
});