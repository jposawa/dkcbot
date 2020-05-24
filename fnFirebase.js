const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

const fbConfig = require("./fbConfig.json");

firebase.initializeApp(fbConfig);
const fbDb = firebase.database();

const fnFirebase = {};

fnFirebase['vincular'] = (msg, email, idDiscord) =>{
    let resposta;
    // console.log(idDiscord);
    try 
    {
        resposta = fbDb.ref('usuarios').once('value', snapshot =>{
            const resultado = snapshot.val();

            // console.log(resultado);

            const dadosUsuario = Object.values(resultado).filter(u => (u.email === email))

            if(dadosUsuario.length > 0)
            {
                fbDb.ref('usuarios/' + dadosUsuario[0].id).update({
                    idDiscord:idDiscord
                }).then(() => {
                    msg.channel.createMessage("Usuário vinculado com sucesso");
                }).catch(err => {
                    console.warn(err);
                    msg.channel.createMessage("Não foi possível vincular sua conta ao banco de dados. Tente novamente mais tarde ou entre em contato com @jposawa");
                });
            }
            else if(dadosUsuario.length === 0)
            {
                msg.channel.createMessage("E-mail não cadastrado\nPor favor visite https://dkc.netlify.com");
            }

            // msg.channel.createMessage("teste");
            // console.log(dadosUsuario);
        })
        // resposta = 1;
    }
    catch(err)
    {
        msg.channel.createMessage("Erro desconhecido");
    }

    return resposta;
}

function TodosUsuarios()
{
    return fbDb.ref('usuarios').once('value');
}

module.exports = fnFirebase;