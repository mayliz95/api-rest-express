const debug = require('debug')('app:inicio')
//const dbDebug = require('debug')('app:db')
const express = require('express')
const config = require('config')
const logger = require('./logger')
const joi = require('joi');
const app = express();
const morgan = require('morgan')

app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(express.static('public'))

//Configuración de entornos
console.log('Aplicación: ' + config.get('nombre'))
console.log('BD server: ' + config.get('configDB.host'))

//Uso de middleware de tercero - Morgan
if(app.get('env') === 'development') {
    app.use(morgan('tiny'))
    debug('Morgan está habilitado')
}

//Trabajo con la bdd
debug('Conectando con la bd')

// app.use(logger);
// app.use(function(req,res,next){
//     console.log('Autenticado.......')
//     next()
// });

const usuarios = [
    {id: 1, nombre: 'May'},
    {id: 2, nombre: 'Liz'} 
]

//consulta
app.get('/', (req, res) => {
    res.send('Hola mundo desde Express')
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios)
});

app.get('/api/usuarios/:id', (req, res) => {
    
    let usuario = existeUsuario(req.params.id)

    if (!usuario) res.status(400).send('El usuario no fue encontrado')
    res.send(usuario)    
});

app.get('/api/usuarios/:year/:day', (req, res) => { 
    res.send(req.query)
});

//Creación
app.post('/api/usuarios', (req, res) => {

    const {error,value} = validarUsuario(req.body.nombre)    
    if(!error) {
        const usuario = {
            id: usuarios.length + 1,
            nombre: value.nombre
        };
        usuarios.push(usuario);
        res.send(usuario)
    } else {
        const msj = error.details[0].message;
        res.status(400).send(msj)
    }
})

//Actualización
app.put('/api/usuarios/:id',(req, res) => {

    //Enontrar si existe el objeto usuario
    let usuario = existeUsuario(req.params.id)
    if (!usuario) {        
        res.status(400).send('El usuario no fue encontrado')
        return
    }

    const {error,value} = validarUsuario(req.body.nombre)
    if(error) {
        const msj = error.details[0].message;
        res.status(400).send(msj)
        return;
    }

    usuario.nombre = value.nombre
    res.send(usuario)
})

//Eliminar
app.delete('/api/usuarios/:id',(req, res) => {
    let usuario = existeUsuario(req.params.id)
    if (!usuario) {        
        res.status(400).send('El usuario no fue encontrado')
        return
    }

    const index = usuarios.indexOf(usuario)
    usuarios.splice(index,1)
    
    res.send(usuario)
})

const port = process.env.port || 3000;
app.listen(port, () => {console.log(`Escuchando en el puerto ${port}`)})

function existeUsuario(idv) {
    return(usuarios.find(u=> u.id === parseInt(idv)))
} 

function validarUsuario(nom) {

    const schema = joi.object({
        nombre: joi.string().min(3).required()
    })

    return(schema.validate({ nombre: nom}))
}