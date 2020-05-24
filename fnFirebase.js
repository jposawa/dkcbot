const firebase = require("firebase/app");
require("firebase/auth");
require("firebase/database");

const fbConfig = require("./fbConfig.json");

firebase.initializeApp(fbConfig);
const fbDb = firebase.database();

const fnFirebase = {};

fnFirebase['vincular'] = (email, idDiscord) =>{
    let resposta;
    // console.log(idDiscord);
    try 
    {
        fbDb.ref('usuarios').once('value', snapshot =>{
            const resultado = snapshot.val();

            // console.log(resultado);

            const dadosUsuario = Object.values(resultado).filter(u => (u.email === email))

            if(dadosUsuario.length > 0)
            {
                fbDb.ref('usuarios/' + dadosUsuario[0].id).update({
                    idDiscord:idDiscord
                });
            }
            // console.log(dadosUsuario);
        });
        resposta = true;
    }
    catch(err)
    {
        resposta = false;
    }

    return resposta;
}

function TodosUsuarios()
{
    return fbDb.ref('usuarios').once('value');
}

module.exports = fnFirebase;