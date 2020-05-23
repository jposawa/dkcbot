const eris = require("eris");
const {BOT_TOKEN, BOT_OWNER_ID} = require("./config.json");

const bot = new eris.Client(BOT_TOKEN);

const PREFIX = "dkc!";

const comandoPorNome = {};

// const comandoPorNome = require('./comandos.js');
//INICIALIZAÇÃO
bot.on('ready', () =>{
    console.log("Conectado e pronto");
});


//LISTA DE COMANDOS//

comandoPorNome['comandos'] = {
    apenasDono:false,
    executar: (msg, args) =>{
        let mensagem = "Atualmente existem os seguintes comandos:\n";
        mensagem += "**comandos** -> Lista de comandos\n";
        mensagem += "**ajuda** -> Lista de comandos\n";
        mensagem += "**sobre** -> Um pouco sobre o bot\n";
        mensagem += "**ficha** -> Retorna site para criação de ficha"; 

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

//LISTA DE COMANDOS//


//CHAMADAS BOT
bot.on('messageCreate', async(msg) => {
    //MENÇÃO AO BOT
    const botMencionado = msg.mentions.find(
        usuarioMencionado => usuarioMencionado.id === bot.user.id,
    );

    if(botMencionado)
    {
        try
        {
            await msg.channel.createMessage("Opa");
        }
        catch(err)
        {
            console.warn("Deu bom não");
            console.warn(err);
        }
    }

    //PREPARAR COMANDO
    const conteudo = msg.content;

    if(!msg.channel.guild)
    {
        // console.log("Não está na guilda");
        return;
    }

    if(!conteudo.startsWith(PREFIX))
    {
        // console.warn("Prefixo errado");
        return;
    }

    const partes = conteudo.split(' ').map(s => s.trim()).filter(s => s);
    const nomeComando = partes[0].substr(PREFIX.length);

    // const executaComando = commandHandlerForComandName[nomeComando];
    const comando = comandoPorNome[nomeComando];
    if(!comando)
    {
        // console.warn("Tem ruim");
        // console.log(comandoPorNome);
        return;
    }

    // console.log(msg.author);
    console.log(msg.member);
    console.log(msg.member.roles);

    const args = partes.slice(1);

    try
    {
        // console.log(args);
        // console.log(msg);
        await comando.executar(msg, args);
    }
    catch(err)
    {
        console.warn('Erro no comando handling');
        console.warn(err);
    }
});

bot.on('error', err => {
    console.warn(err);
});

bot.connect();