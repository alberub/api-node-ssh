const express = require('express');
const app = express();
const port = 3000;

function funcionDuplicada() {
    return 'Pipelina de sonarqube con responsabilidad única';
}

app.get('/', (req, res) => {
    res.send(funcionDuplicada());
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
