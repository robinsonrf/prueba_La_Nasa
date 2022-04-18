$('button').click(async ()=>{
    const email = $('#email').val();
    const nombre = $('#nombre').val();
    const password = $('#password').val();

    const payload = {email, nombre, password}

    try{
        await axios.post('/usuarios', payload)
        alert('Usuario registrado con exito');
        window.location.href = "/login";
    }
    catch({response}){
        const {data} = response;
        const {error} = data;
        alert(error);
    }
});


const changeStatus = async (id, e) =>{
    const auth = e.checked;
    try{
        await axios.put("http://localhost:3000/usuarios",{
            id,
            auth
          });
          alert(auth? "Usuario habilitado para subir fotos" : "Usuario Deshabilitado para subir fotos")
        }catch({response}){
            const {data} = response;
            const {error} = data;
            alert(error);
        }
    }
    