const express = require('express');
const app = express();
const port = 3000;

function funcionDuplicada() {
    return 'API nodejs desplegada vía SSH con Jenkins y github(WebHook)';
}

app.get('/', (req, res) => {
    res.send(funcionDuplicada());
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
