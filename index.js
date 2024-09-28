const express = require('express');
const app = express();
const port = 3000;

function funcionDuplicada() {
    return 'Primer commit con un pipeline llamando a otro.';
}

app.get('/', (req, res) => {
    res.send(funcionDuplicada());
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
