const express = require('express');
const app = express();
const exphbs = require('express-handlebars');
const expressFileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const path = require('path');
const jwt = require('jsonwebtoken');
const {nuevoUsuario, getUsuarios, getUsuario, setUsuarioStatus}= require('./consulta');
const  send  = require('./correo');
const secretKey = 'Shhhh';
const port = 3000;

app.listen(port, ()=> console.log(`Server ON, Puerto: ${port}`));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(__dirname + "/public"));
app.use(
    expressFileUpload({
        limits: 5000000,
        abortOnLimit: true,
        responseOnLimit: "El tamaño de la imagen supera el limite permitido",
    })
);
app.set("view engine", "handlebars");
app.set('views',path.join(__dirname, "views", "layouts"));

//Ruta Middleware CSS BOOTSTRAP 
app.use("/css", express.static(__dirname + "/node_modules/bootstrap/dist/css"));

//Ruta Middleware jQuery 
app.use('/dist', express.static(path.join(__dirname,"/node_modules/jquery/dist")));

//Ruta a carpeta assets
app.use('/assets', express.static(path.join(__dirname,"/assets")));

app.engine(
    "handlebars",
    exphbs.engine({
        defaultLayout: "main",
        layoutsDir: app.get('views'),
        partialsDir: path.join(__dirname, "views", "components")
    })
);

//Rutas
app.get("/", (req,res)=>{
    res.render("main",{
        layout: 'main',
    });
});

app.post("/usuarios", async (req,res)=>{
    const {email, nombre, password} = req.body;
    try{
        const usuario = await nuevoUsuario(email, nombre, password);
        res.status(201).send(JSON.stringify(usuario));
    }catch (e){
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
});

app.put("/usuarios", async (req, res)=>{
    const {id, auth} = req.body;
    try{
        const usuario = await setUsuarioStatus(id, auth);
        res.status(200).send(JSON.stringify(usuario));
    }catch(e){
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
});

app.get("/Admin", async (req, res)=>{
    try{
        const usuarios = await getUsuarios();
        res.render("Admin", {
            layout: "Admin",
            usuarios: usuarios
        })
    }catch(e){
        res.status(500).send({
            error: `Algo salio mal... ${e}`,
            code: 500
        });
    }
});

app.get("/Login", (req,res)=>{
     res.render("Login", {
        layout: 'Login',
     });
});

app.post("/verify", async (req,res)=>{
    const {email, password} = req.body;
    const user = await getUsuario(email, password)
    if (user){
        if (user.auth){
            const token = jwt.sign(
                {
                  exp: Math.floor(Date.now()/ 100) + 180,
                  date: user,  
                },
                secretKey
            );
            res.send(token);
        }else{
            res.status(401).send({
                error: "Este usuario aun no ha sido validado para subir imagenes",
                code: 401,
            });
        }
    }else{
        res.status(404).send({
            error: "Este usuario no esta registrado en la base de datos",
            code: 404,
        });
    }
});

app.get("/Evidencias", (req,res)=>{
    const {token} = req.query;
    jwt.verify(token, secretKey, (err, decoded)=>{
        const data = decoded
        const {nombre, email} = data.date;
        err
            ? res.status(401).send(
                res.send({
                    error:"401 Unauthorized",
                    message: "Usted no esta autorizado para estar aqui",
                    token_error: err.message,
                })
            )
            :res.render("Evidencias", {
                layout: "Evidencias",
                nombre: nombre,
                email: email
            })
    });
});

app.post("/upload", (req, res)=>{
    if ( Object.keys(req.files).length == 0){
        return res.status(400).send("No se encontro ningun archivo en la consulta");
    }
    const {files} = req;
    const {foto} = files;
    const {name} = foto;
    const {email, nombre} = req.body;
    console.log(email);
    foto.mv(`${__dirname}/public/uploads/${name}`, async (err)=>{
        if (err) return res.status(500).send({
            error: `Algo salio mal...  ${err}`,
            code: 500
        })
        await send(email, nombre)
        res.send("Foto cargada con exito")
    })
})