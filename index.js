const express = require('express');
const app = express();
const port = 3000;

function funcionDuplicada() {
    return 'Ejemplo de api sin jenkinsfile';
}

app.get('/', (req, res) => {
    res.send(funcionDuplicada());
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
