const nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
    service: "gmail",
    auth:{
        user: "rabsad@gmail.com",
        pass: "asduu2123"
    },
});

const send = async (email, nombre) =>{
    let mailOptions ={
        from: "rabyrez3@gmail.com",
        to: [email],
        subject: `Saludos desde la NASA`,
        html: `<h3> HOLA, ${nombre}!! <br> La Nasa te da las gracias por subir tu foto a nuestro sistema y colaborar con las investigaciones extraterrestes`
    }
    await transporter.sendMail(mailOptions);
};

module.exports = send;