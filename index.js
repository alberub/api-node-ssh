const express = require('express');
const app = express();
const port = 3000;

function funcionDuplicada() {
    return 'API nodejs desplegada vía SSH con Jenkins y github(WebHook)';
}

app.get('/', (req, res) => {
    res.send(funcionDuplicada());
});

// app.get('/', (req, res) => {
//     const cadena1 = 'Hola mundo';
//     const cadena2 = 'hola mundo';
//     const arr = [1,2,3,4,5];
//     let nuevoMensaje = '';
//     let mensaje = '';
//     if (cadena1 != cadena2) {
//         mensaje = 'Las cadenas son iguales';
//         if (arr.some(1)) {            
//             arr.forEach( el => {
//                 if (el === 3) {
//                     nuevoMensaje = "El número 3 se encuentra en el array";
//                     if (nuevoMensaje.trim().length > 0) {
//                         nuevoMensaje = "Entró en la segunda condición";
//                     }                
//                 }
//             })
//         }
//     }
//     res.send(funcionDuplicada());
// });

app.listen(port, () => {
    console.log(`Servidor escuchando en el puerto ${port}`);
});
