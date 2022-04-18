const {Pool} = require('pg');
const { password } = require('pg/lib/defaults');
const pool = new Pool({
    user: "postgres",
    host: "localhost",
    database: "nasa",
    password: "raby1949",
    port: 5432,
});

const nuevoUsuario = async(email, nombre, password) =>{
    const result = await pool.query(
        `INSERT INTO usuarios (email, nombre, password, auth) values ('${email}', '${nombre}', '${password}', false) RETURNING *`
    );
    const usuario = result.rows[0];
    return usuario;
}

const getUsuarios = async () =>{
    const result = await pool.query(`SELECT * FROM usuarios`);
    return result.rows;
}

const setUsuarioStatus = async (id, auth) =>{
    const result = await pool.query(
        `UPDATE usuarios SET auth = ${auth} WHERE id = ${id} RETURNING *`
    );
    const usuario = result.rows[0];
    return usuario;
}

const getUsuario = async (email, password) =>{
    const result = await pool.query(
        `SELECT * FROM usuarios WHERE email = '${email}' AND password = '${password}'`
    );
    return result.rows[0];
}

module.exports = {
   nuevoUsuario, getUsuarios, setUsuarioStatus, getUsuario 
}