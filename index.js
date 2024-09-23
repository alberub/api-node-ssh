const express = require('express');
const app = express();
const port = 3000;

// Ruta raíz
app.get('/', (req, res) => {
    res.send('¡Despliegue de api con jenkins via SSH');
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
