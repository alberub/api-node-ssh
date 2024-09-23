const express = require('express');
const app = express();
const port = 3000;

// Ruta raíz
app.get('/', (req, res) => {
    const cadena1 = 'Hola mundo';
    const cadena2 = 'hola mundo';
    let mensaje = '';
    if (cadena1 == cadena2) {
        mensaje = 'Las cadenas son iguales';
    }
    res.send(`Despliegue de api en servidor via SSH: ${mensaje}`);
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
