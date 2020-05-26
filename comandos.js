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

        mensagem += "\n\nCaso queira mais informações sobre algum comando, use dkc!ajuda *comando*";

        msg.channel.createMessage(mensagem);
    }
};

comandoPorNome['ajuda'] = {
    executar: (msg, args) => {
        let comandos;
        console.log(args.length);
        if(args.length === 0)
        {
            comandoPorNome.comandos.executar(msg);
        }
        else
        {
            comandos = args.filter(arg => {
                let inicial = arg[0]+arg[1];
                return inicial !== "<@";
            })
            comandos.forEach(comando => {
                InfoComando(msg,comando);
            })
        }
    }
}

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
        if(msg.mentions.length === 0)
        {
            fnFirebase.mesas(msg, msg.author.id);
        }
        else
        {
            msg.mentions.forEach(mencao => {
                fnFirebase.mesas(msg, mencao.id);
            })
        }
    }
}

comandoPorNome['ativarMesa'] = {
    executar: (msg, args) => {
        if(args.length === 0)
        {
            msg.channel.createMessage("É necessário informar qual mesa deseja ser ativada");
        }
        else
        {
            let parametros = args.join(" ");
            parametros = parametros.split("<");
            parametros = parametros[0].trim();
            // console.log(parametros);

            if(msg.mentions.length === 0)
            {
                fnFirebase.ativarMesa(msg, parametros, msg.author.id);
            }
            else
            {
                msg.mentions.forEach(mencao => {
                    fnFirebase.ativarMesa(msg, parametros, mencao.id);
                })
            }
        }
    }
}

comandoPorNome['fichas'] = {
    executar: (msg, args) => {
        if(msg.mentions.length === 0)
        {
            fnFirebase.fichas(msg, msg.author.id)
        }
        else
        {
            msg.mentions.forEach(mencao => {
                fnFirebase.fichas(msg, mencao.id)
            })
        }
    }
}

comandoPorNome['ativarFicha'] = {
    executar: (msg, args) => {
        if(args.length === 0)
        {
            msg.channel.createMessage("É necessário informar qual ficha deseja ser ativada");
        }
        else
        {
            let parametros = args.join(" ");
            parametros = parametros.split("<");
            parametros = parametros[0].trim();
            // console.log(parametros);

            if(msg.mentions.length === 0)
            {
                fnFirebase.ativarFicha(msg, parametros, msg.author.id);
            }
            else
            {
                msg.mentions.forEach(mencao => {
                    fnFirebase.ativarFicha(msg, parametros, mencao.id);
                })
            }
        }
    }
}

comandoPorNome['dadosFicha'] = {
    executar: (msg, args) => {
        let filtro;
        if(args.length > 0)
        {
            filtro = args.join("|");
            filtro = filtro.split("<");
            if(filtro[0] === "")
            {
                filtro = filtro[1];
                filtro = filtro.split("|");
                // console.log("caplow");
                if(filtro[0][0] === "@")
                {
                    filtro = filtro.slice(1);
                }
            }
            else
            {
                filtro = filtro[0];
                filtro = filtro.split("|");
                // console.log("xablau");
                if(filtro[filtro.length-1][0] === "@")
                {
                    filtro.pop();
                }
            }
        }
        if(msg.mentions.length === 0)
        {
            fnFirebase.dadosFicha(msg, msg.author.id, filtro);
        }
        else
        {
            msg.mentions.forEach(mencao => {
                fnFirebase.dadosFicha(msg, mencao.id, filtro);
            });
        }
    }
}

comandoPorNome['rolar'] ={
    executar: (msg, args) =>{
        let parametros = [...args];

        if(args.length > 0)
        {
            if(msg.mentions.length > 0)
            {
                parametros = parametros.filter(param => {
                    let inicioParam;
                    if(param.length > 1)
                    {
                        inicioParam = param[0]+param[1];
                    }
                    else
                    {
                        inicioParam = "";
                    }

                    return inicioParam !== "<@";
                });
            }
            parametros = [parametros.join(' ')];
        }

        // console.log(parametros);

        if(msg.mentions.length === 0)
        {
            fnFirebase.rolar(msg, parametros, msg.author.id);
        }
        else
        {
            msg.mentions.forEach(mencao => {
                fnFirebase.rolar(msg, parametros, mencao.id);
            })
        }
    }
}

function InfoComando(msg, nomeComando)
{
    // console.log("Oi" + nomeComando);
    let prefixo = "dkc!";
    let mensagem = "*"+prefixo+nomeComando+"* ";
    let minimoUp = 85;
    switch(nomeComando)
    {
        default:
            mensagem = "Não reconheci o comando " + nomeComando;
            mensagem += "\nPor favor veja se é esse o nome correto";
        break;

        case "comando":
            mensagem += "serve para mostrar a lista de comandos que eu posso executar";
        break;

        case "sobre":
            mensagem += "é utilizado quando alguém quer saber um pouco sobre mim, mas eu não sei muito o que dizer...";
        break;

        case "ficha":
            mensagem += "dá instruções de onde fazer a sua ficha de personagem";
        break;

        case "vincular":
            mensagem += "serve para me conectar ao seu cadastro na plataforma Draenak. Somente após esse comando eu consigo te encontrar no banco de dados do sistema para poder ler os dados de ficha e mesa";
            mensagem += "\nPara vincular com a sua conta utilize o mesmo e-mail do site junto ao comando.\nAssim: *" + prefixo + "vincular **e-mail***";
        break;

        case "mesas":
            mensagem += "comando para buscar a lista de mesas que estão conectadas ao seu cadastro";
        break;

        case "ativarMesa":
            mensagem += "com esse comando você me diz em qual mesa eu devo buscar informações de ficha.";
            mensagem += "\nPara utilizar esse comando, eu preciso saber qual mesa você quer que eu fique olhando no seu cadastro. Para isso, informe um parâmetro, que pode ser o número de acordo com a lista que eu te informar, ou então o nome da mesa, exatamente como está na lista";
            mensagem += "\nPortanto o comando é: *" + prefixo + nomeComando + "**parametro***\n";
            mensagem += "\nSe quiser parar de apontar para alguma mesa, para buscar algum personagem que está fora de alguma mesa, por exemplo, basta colocar **SM** como parâmetro";
        break;

        case "fichas":
            mensagem += "é parecido com o comando para listar mesas. Eu vou buscar os personagens ligados à sua conta na mesa selecionada. Caso não exista uma mesa selecionada, eu procurarei por fichas que foram criadas sem mesa (SM)";
        break;

        case "ativarFicha":
            mensagem += "serve para apontar para uma ficha específica. Para escolher uma ficha, coloque como parâmetro o número da ficha listada ao usar *" + prefixo + "fichas*, ou o nome do personagem exatamente como está na ficha";
            mensagem += "\nÉ importante lembrar que eu só posso apontar para um personagem que esteja na mesa selecionada";
        break;

        case "dadosFicha":
            mensagem += "é o comando para trazer todas as informações do personagem que estão no site de Draenak.";
            mensagem += "\nAdicionalmente você pode me informar qual tipo de informação você quer trazer, entre as seguintes opções: *[atributos, competencias, tracos, itens]*. Caso queira buscar com um desses parâmetros, escreva-o exatamente como mostrei aqui";
            mensagem += "\nPor exemplo: *" + prefixo + "dadosFicha atributos*";
        break;

        case "rolar":
            mensagem += "uma de minhas principais funções é fazer rolagem de dados para jogar.";
            mensagem += "\nVocê pode fazer rolagens simples ou passar algum parâmetro para fazer a rolagem, sendo esse parâmetro um atributo ou competência";
            mensagem += "\nPor algum motivo que eu ainda não entendi, o meu criador me fez para buscar atributos sem caracteres especiais e apenas com letras minúsculas, enquanto as competências devem ser escritas como estão na ficha.";
            mensagem += "\nDeve ser preguiça ou alguma coisa que ele descobriu depois, vai entender...\n";
            mensagem += "\nEXEMPLOS:";
            mensagem += "\nPara rolar Coordenação use *" + prefixo + "rolar coordenacao*";
            mensagem += "\nPara rolar Artes Marciais use *" + prefixo + "rolar Artes Marciais*";
            mensagem += "\n(Observe que para Competências você não precisa colocar o caractere **°**)";
            mensagem += "\nÉ importante lembrar que competências que tenham rolagem natural (Sem considerar modificadores) acima de 85 evoluem 1 ponto, ou são aprendidas caso a ficha não possua a Competência";
            mensagem += "\n\nVocê também pode colocar modificadores no atributo ou alterar a dificuldade, por exemplo:\n*" + prefixo + "rolar Artes Marciais+2>45* para adicionar 2 ao resultado e alterar a dificuldade para 45";
        break;

        case "xablau":
            mensagem = "Xablau?";
        break;
    }

    msg.channel.createMessage(mensagem);
}

comandoPorNome['xablau'] = {
    executar:(msg, args)=>{
        msg.channel.createMessage("Xablau tu! <@"+msg.author.id+">");
    }
}

module.exports = comandoPorNome;