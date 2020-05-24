const comandoPorNome = {};
const fnFirebase = require('./fnFirebase.js');
const {BOT_OWNER_ID} = require('./config.json');

/* comandoPorNome['sobre'] = (msg, args) => {
    msg.channel.send("Sou apenas um bot para auxiliar a jogar Draenak");
    msg.channel.send("Para criar sua ficha acesse https://dkc.netlify.app/");
    // return msg.channel.createMessage("Sou apenas um bot para auxiliar a jogar Draenak");
} */

comandoPorNome['comandos'] = {
    apenasDono:false,
    executar: (msg, args) =>{
        let listaComandos = Object.keys(comandoPorNome);
        let mensagem = "Atualmente existem os seguintes comandos:";
        
        listaComandos.forEach(nomeComando => {
            mensagem += "\n**"+nomeComando+"**";
        })

        msg.channel.createMessage(mensagem);
    }
};

comandoPorNome['ajuda'] = comandoPorNome.comandos;

comandoPorNome['sobre'] = {
    apenasDono:false,
    executar: (msg,args) =>{
        msg.channel.createMessage("Sou apenas um bot para auxiliar a jogar Draenak");
        // msg.channel.createMessage("Para criar sua ficha acesse https://dkc.netlify.app/");
    }
    //return msg.channel.createMessage("Sou apenas um bot novinho para tentar ajudar a jogar Draenak");
};

comandoPorNome['ficha'] = {
    apenasDono:false,
    executar: (msg, args) => {
        msg.channel.createMessage("O site para criar sua ficha é https://dkc.netlify.app");
    }
}

comandoPorNome['vincular'] = {
    executar: (msg, args) =>{
        let resposta = "";
        let funcionou;

        if(args.length === 0)
        {
            resposta = "É necessário informar pelo menos o seu e-mail para vincular a conta com nosso banco de dados";
        }
        else
        {
            if(msg.mentions.length === 0)
            {
                funcionou = fnFirebase.vincular(msg, args[0], msg.author.id);
            }
            else if(msg.mentions.length > 1)
            {
                msg.channel.createMessage("Por favor mencione apenas um usuário para ser vinculado, ou nenhum para vincular você");
            }
            else
            {
                if(msg.author.id === BOT_OWNER_ID)
                {
                    funcionou = fnFirebase.vincular(msg, args[0], msg.mentions[0].id);
                }
                else
                {
                    msg.channel.createMessage("Apenas o dono da conta ou administradores do bot podem vincular contas de terceiros");
                }
            }
        }
    }
}

comandoPorNome['mesas'] = {
    executar: (msg, args) => {

    }
}

module.exports = comandoPorNome;