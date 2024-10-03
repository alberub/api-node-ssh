const express = require('express');
require('dotenv').config();
const app = express();

function funcionDuplicada() {
    return 'API nodejs desplegada vía SSH con Jenkins y github(WebHook)';
}

app.get('/', (req, res) => {
    res.send(funcionDuplicada());
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${process.env.PORT}`);
});
