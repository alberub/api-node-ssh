const express = require('express');
const app = express();
const port = 3000;

function funcionDuplicada() {
    return 'Códio duplicado para que falle sonar';
}

function funcionDuplicada() {
    return 'Códio duplicado para que falle sonar';
}

// Ruta raíz
app.get('/', (req, res) => {
    const cadena1 = 'Hola mundo';
    const cadena2 = 'hola mundo';
    let mensaje = '';
    if (cadena1 == cadena2) {
        mensaje = 'Las cadenas son iguales';
    }
    res.send(funcionDuplicada());
});

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
