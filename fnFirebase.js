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
        })
    }
    catch(err)
    {
        msg.channel.createMessage("Erro desconhecido");
    }

    return resposta;
}

fnFirebase['mesas'] = (msg, idDiscord) => {
    //RECUPERA USUÁRIOS
    fbDb.ref('usuarios').once('value', snapshot => {
        const resultado = snapshot.val();

        const dadosUsuario = Object.values(resultado).filter(u => (u.idDiscord === idDiscord));

        if(dadosUsuario.length === 0)
        {
            msg.channel.createMessage("Usuário ainda não vinculado ao servidor Draenak");
        }
        else
        {
            const idUsuario = dadosUsuario[0].id;
            const mesaDiscord = dadosUsuario[0].mesaDiscord;
            // console.log(mesaDiscord);
            fbDb.ref('mesas').once('value', snapshot => {
                const resultado = snapshot.val();

                // console.log(resultado);

                const mesasUsuario = Object.values(resultado).filter(mesa => (Object.keys(mesa.membros).includes(idUsuario)));

                if(mesasUsuario === 0)
                {
                    msg.channel.createMessage("Usuário não faz parte de nenhuma mesa na plataforma Draenak");
                }
                else
                {
                    let mensagem = "O usuário faz parte das seguintes mesas:";
                    let contador = 1;
                    Object.values(mesasUsuario).forEach(mesa => {
                        mensagem += "\n";
                        mensagem += "*"
                        if(mesa.id == mesaDiscord)
                        {
                            mensagem += "**";
                        }
                        mensagem += "[" + contador++ + "] " + mesa.nome + " (" + mesa.modulo + ")";
                        if(mesa.id == mesaDiscord)
                        {
                            mensagem += "**";
                        }
                        mensagem += "*";
                    });

                    mensagem += "\nCaso queira ativar uma mensagem, use o comando \"**dkc!ativarMesa *parâmetro***\" (O parâmetro pode ser o número do menu ou o nome da mesa)";
                    mensagem += "\nSe quiser limpar a seleção de mesas, use SM como parâmetro";
                    msg.channel.createMessage(mensagem);
                }

                // console.log(mesasUsuario);
            })
        }
    })
}

fnFirebase['ativarMesa'] = (msg, refMesa, idDiscord) =>{
    fbDb.ref('usuarios').once('value',snapshot => {
        const listaUsuarios = snapshot.val()

        const dadosUsuario = Object.values(listaUsuarios).filter(u => (u.idDiscord == idDiscord))

        if(dadosUsuario.length === 0)
        {
            msg.channel.createMessage("Usuário não está vinculado à plataforma Draenak")
        }
        else
        {
            const idUsuario = dadosUsuario[0].id;
            
            fbDb.ref('mesas').once('value', snapshot => {
                const listaMesas = snapshot.val();

                const mesasUsuario = Object.values(listaMesas).filter(mesa => (Object.keys(mesa.membros).includes(idUsuario)))

                if(mesasUsuario === 0)
                {
                    msg.channel(createMessage("Usuário não faz parte de nenhuma mesa na plataforma Draenak"))
                }
                else
                {
                    let mesaEscolhida;

                    if(!isNaN(parseInt(refMesa)))
                    {
                        refMesa = parseInt(refMesa);
                        if(refMesa > mesasUsuario.length || refMesa < 0)
                        {
                            msg.channel.createMessage("Número da mesa inválido")
                        }
                        else
                        {
                            mesaEscolhida = mesasUsuario[--refMesa]
                        }
                    }
                    else if(refMesa.toUpperCase() !== "SM")
                    {
                        mesaEscolhida = mesasUsuario.filter(mesa => (mesa.nome === refMesa))
                        
                        if(mesaEscolhida.length === 0)
                        {
                            msg.channel.createMessage("Nome da mesa inválido")
                        }
                        else
                        {
                            mesaEscolhida = mesaEscolhida[0];
                        }
                    }
                    else
                    {
                        mesaEscolhida = {
                            id:"SM"
                        };
                    }

                    if(mesaEscolhida !== null && mesaEscolhida !== undefined)
                    {
                        const mesaDiscord = mesaEscolhida.id;

                        fbDb.ref('usuarios/' + idUsuario).update({
                            mesaDiscord:mesaDiscord
                        }).then(() => {
                            if(mesaEscolhida.id === "SM")
                            {
                                msg.channel.createMessage("Limpada seleção de mesa");
                            }
                            else
                            {
                                msg.channel.createMessage("Mesa **" + mesaEscolhida.nome + "** ativada com sucesso");
                            }
                        }).catch(err => {
                            console.warn(err);
                            msg.channel.createMessage("Erro inesperado ao ativar mesa");
                        })
                    }
                }
            })
        }
    })
}

fnFirebase['fichas'] = (msg, idDiscord) => {
    fbDb.ref('usuarios').once('value', snapshot => {
        listaUsuarios = snapshot.val();

        const dadosUsuario = Object.values(listaUsuarios).filter(u => (u.idDiscord == idDiscord))

        if(dadosUsuario.length === 0)
        {
            msg.channel.createMessage("Usuário não vinculado")
        }
        else
        {
            const {fichaDiscord} = dadosUsuario[0];
            let {mesaDiscord} = dadosUsuario[0];
            const idUsuario = dadosUsuario[0].id

            if(mesaDiscord === undefined || mesaDiscord === null || mesaDiscord === "")
            {
                mesaDiscord = "SM";
            }

            fbDb.ref('fichas').once('value',snapshot => {
                const listaFichas = snapshot.val();

                // console.log(listaFichas);
                
                const fichasMesaDiscord = listaFichas[idUsuario][mesaDiscord];

                // console.log(listaFichas[idUsuario][mesaDiscord]);

                if(fichasMesaDiscord === undefined || fichasMesaDiscord === null)
                {
                    msg.channel.createMessage("Não existe ficha na mesa atual");
                }
                else
                {
                    let mensagem = "Na mesa atual do usuário existem as seguintes fichas:\n";
                    let contador = 1;
                    Object.values(fichasMesaDiscord).forEach(ficha => {
                        mensagem += "*";
                        if(ficha.id == fichaDiscord)
                        {
                            mensagem += "**";
                        }
                        mensagem += "[" + contador++ + "] ";
                        mensagem += ficha.nome;
                        if(ficha.id == fichaDiscord)
                        {
                            mensagem += "**";
                        }
                        mensagem += "*";
                        mensagem += "\n";
                    })

                    mensagem += "\nPara selecionar um personagem use o comando \"**dkc!ativarFicha *parâmetro***\" sendo o parâmetro o número no menu ou o nome da ficha";
                    msg.channel.createMessage(mensagem);
                }
            })
        }
    })
}

fnFirebase['ativarFicha'] = (msg, refFicha, idDiscord) =>{
    fbDb.ref("usuarios").once("value", snapshot => {
        const listaUsuarios = Object.values(snapshot.val());

        const dadosUsuario = listaUsuarios.filter(u => (u.idDiscord == idDiscord))

        if(dadosUsuario.length === 0)
        {
            msg.channel.createMessage("Usuário não está vinculado à plataforma Draenak");
        }
        else
        {
            const idUsuario = dadosUsuario[0].id;
            let {mesaDiscord} = dadosUsuario[0];

            if(mesaDiscord === undefined || mesaDiscord === null || mesaDiscord === "")
            {
                mesaDiscord = "SM";
            }
            
            fbDb.ref('fichas').once('value', snapshot =>{
                const listaFichas = snapshot.val();

                const fichasUsuario = listaFichas[idUsuario][mesaDiscord];

                if(fichasUsuario === null || fichasUsuario === undefined)
                {
                    msg.channel.createMessage("Não existem fichas na mesa atual");
                }
                else
                {
                    const valoresFichasUsuarios = Object.values(fichasUsuario);
                    let fichaEscolhida;
                    if(!isNaN(parseInt(refFicha)))
                    {
                        refFicha = parseInt(refFicha);
                        if(refFicha > valoresFichasUsuarios.length || refFicha < 0)
                        {
                            msg.channel.createMessage("Número da ficha inválido");
                        }
                        else
                        {
                            fichaEscolhida = valoresFichasUsuarios[--refFicha];
                        }
                    }
                    else
                    {
                        fichaEscolhida = valoresFichasUsuarios.filter(vfu => (vfu.nome == refFicha));

                        if(fichaEscolhida.length === 0)
                        {
                            msg.channel.createMessage("Nome da ficha inválido");
                        }
                        else
                        {
                            fichaEscolhida = fichaEscolhida[0];
                        }
                    }

                    if(fichaEscolhida !== null && fichaEscolhida !== undefined)
                    {
                        const fichaDiscord = fichaEscolhida.id;

                        fbDb.ref('usuarios/'+idUsuario).update({
                            fichaDiscord:fichaDiscord,
                            mesaDiscord:mesaDiscord
                        }).then(() => {
                            msg.channel.createMessage("Ficha **" + fichaEscolhida.nome + "** ativada com sucesso");
                        }).catch(err =>{
                            console.warn(err);
                            msg.channel.createMessage("Erro inesperado ao ativar ficha");
                        })
                    }
                }
            })
        }
    })
}

fnFirebase['dadosFicha'] = (msg, idDiscord, filtro) =>{
    fbDb.ref('usuarios').once('value', snapshot =>{
        const listaUsuarios = Object.values(snapshot.val());

        const dadosUsuario = listaUsuarios.filter(u => (u.idDiscord == idDiscord));

        if(dadosUsuario.length === 0)
        {
            msg.channel.createMessage("Usuário não está vinculado à plataforma Draenak");
        }
        else
        {
            const idUsuario = dadosUsuario[0].id;
            const {fichaDiscord} = dadosUsuario[0];
            let {mesaDiscord} = dadosUsuario[0];

            if(mesaDiscord === undefined || mesaDiscord === null || mesaDiscord === "")
            {
                mesaDiscord = "SM";
            }

            fbDb.ref('fichas/'+idUsuario+'/'+mesaDiscord+'/'+fichaDiscord).once('value', snapshot => {
                // console.log(snapshot);
                const fichaSelecionada = snapshot.val();
                // console.log(fichaSelecionada);

                if(fichaSelecionada === null || fichaSelecionada === undefined)
                {
                    msg.channel.createMessage("Ficha não encontrada\nCertifique-se de que existe uma ficha ativa na mesa selecionada");
                }
                else
                {
                    const {imagem,atributos,itens,tracos} = fichaSelecionada;
                    let mensagem = "";
                    /* if(imagem !== null && imagem !== undefined && imagem !== "")
                    {
                        mensagem += imagem
                    } */
                    mensagem += "\n**" + fichaSelecionada.nome + "**\n";
                    mensagem += "Pontos: " + fichaSelecionada.pontosGastos + "/" + fichaSelecionada.pontosTotais + "\n";
                    // console.log(fichaSelecionada);
                    // console.log("Meu filtro:");
                    // console.log(filtro);
                    if(filtro !== undefined && filtro !== null && filtro.length > 0)
                    {
                        filtro.forEach(filtro => {
                            filtro = filtro.toLowerCase();
                            console.log(filtro);
                            switch(filtro)
                            {
                                case "atributos" || "Atributos":
                                    mensagem += "\n**#ATRIBUTOS**\n";
                                    mensagem += "**F**ísico = " + atributos.fisico[0] + " | ";
                                    mensagem += "**C**oordenação = " + atributos.coordenacao[0] + "\n";
                                    mensagem += "**I**nteligência = " + atributos.inteligencia[0] + " | ";
                                    mensagem += "**A**stúcia = " + atributos.astucia[0] + "\n";
                                    mensagem += "**V**ontade = " + atributos.vontade[0] + " | ";
                                    mensagem += "**P**resença = " + atributos.presenca[0] + "\n";
                                break;

                                case "tracos" || "traços":
                                    mensagem += "\n**#TRAÇOS**\n";
                                    if(tracos !== null && tracos !== undefined)
                                    {
                                        tracos.forEach(traco => {
                                            mensagem += traco.nome + "\n";
                                        })
                                    }
                                break;

                                case "competencias" || "competências":
                                    mensagem += "\n**#COMPETÊNCIAS**\n";
                                    Object.entries(atributos).forEach((nome) => {
                                        const listaCompetencias = nome[1][1];
                                        const atribCompetencia = nome[0];
                                        // console.log(atribCompetencia);

                                        // console.log(atributo);
                                        // console.log(listaCompetencias);
                                        if(listaCompetencias !== undefined && listaCompetencias !== null)
                                        {
                                            Object.entries(listaCompetencias).forEach((entrada) => {
                                                const nome = entrada[0];
                                                const valor = entrada[1];
                                                mensagem += "**[" + atribCompetencia[0].toUpperCase() + "]** ";
                                                mensagem += "*" + nome + "* (" + valor + ")\n";
                                            })
                                        }
                                    })
                                break;

                                case "itens":
                                    mensagem += "\n**#ITENS**\n";
                                    if(itens !== undefined && itens !== null)
                                    {
                                        itens.forEach(item => {
                                            mensagem += "\n" + item.quantidade + "x " + item.nome;
                                        }) 
                                    }

                                    // msg.channel.createMessage(mensagem);
                                break;

                                default:
                                    // console.log("puffut");
                                    mensagem += "\n**#ATRIBUTOS**\n";
                                    mensagem += "**F**ísico = " + atributos.fisico[0] + " | ";
                                    mensagem += "**C**oordenação = " + atributos.coordenacao[0] + "\n";
                                    mensagem += "**I**nteligência = " + atributos.inteligencia[0] + " | ";
                                    mensagem += "**A**stúcia = " + atributos.astucia[0] + "\n";
                                    mensagem += "**V**ontade = " + atributos.vontade[0] + " | ";
                                    mensagem += "**P**resença = " + atributos.presenca[0] + "\n";

                                    mensagem += "\n**#TRAÇOS**\n";
                                    tracos.forEach(traco => {
                                        mensagem += traco.nome + "\n";
                                    })
                                    
                                    mensagem += "\n**#COMPETÊNCIAS**\n";
                                    Object.entries(atributos).forEach((nome) => {
                                        const listaCompetencias = nome[1][1];
                                        const atribCompetencia = nome[0];
                                        // console.log(atribCompetencia);

                                        // console.log(atributo);
                                        // console.log(listaCompetencias);
                                        if(listaCompetencias !== undefined && listaCompetencias !== null)
                                        {
                                            Object.entries(listaCompetencias).forEach((entrada) => {
                                                const nome = entrada[0];
                                                const valor = entrada[1];
                                                mensagem += "**[" + atribCompetencia[0].toUpperCase() + "]** ";
                                                mensagem += "*" + nome + "* (" + valor + ")\n";
                                            })
                                        }
                                    })
                                    
                                    mensagem += "\n**#ITENS**\n";
                                    if(itens !== null && itens !== undefined)
                                    {
                                        itens.forEach(item => {
                                            mensagem += "\n" + item.quantidade + "x " + item.nome;
                                        }) 
                                    }
                                break;
                            }
                        })
                    }
                    else
                    {
                        // console.log("caplow");
                        mensagem += "\n**#ATRIBUTOS**\n";
                        mensagem += "**F**ísico = " + atributos.fisico[0] + " | ";
                        mensagem += "**C**oordenação = " + atributos.coordenacao[0] + "\n";
                        mensagem += "**I**nteligência = " + atributos.inteligencia[0] + " | ";
                        mensagem += "**A**stúcia = " + atributos.astucia[0] + "\n";
                        mensagem += "**V**ontade = " + atributos.vontade[0] + " | ";
                        mensagem += "**P**resença = " + atributos.presenca[0] + "\n";

                        mensagem += "\n**#TRAÇOS**\n";
                        if(tracos !== undefined)
                        {
                            tracos.forEach(traco => {
                                mensagem += traco.nome + "\n";
                            })
                        }
                        
                        mensagem += "\n**#COMPETÊNCIAS**\n";
                        Object.entries(atributos).forEach((nome) => {
                            const listaCompetencias = nome[1][1];
                            const atribCompetencia = nome[0];
                            // console.log(atribCompetencia);

                            // console.log(atributo);
                            // console.log(listaCompetencias);
                            if(listaCompetencias !== undefined && listaCompetencias !== null)
                            {
                                Object.entries(listaCompetencias).forEach((entrada) => {
                                    const nome = entrada[0];
                                    const valor = entrada[1];
                                    mensagem += "**[" + atribCompetencia[0].toUpperCase() + "]** ";
                                    mensagem += "*" + nome + "* (" + valor + ")\n";
                                })
                            }
                        })
                        
                        mensagem += "\n**#ITENS**\n";
                        if(itens !== undefined)
                        {
                            itens.forEach(item => {
                                mensagem += "\n" + item.quantidade + "x " + item.nome;
                            })
                        }
                    }

                    const embed = msg.channel.createEmbed(msg.channel.id);
                    embed.thumbnail(imagem);
                    embed.description(mensagem);
                    // const enviaEmbed = erisEmbedBuider
                    // console.log(embed);
                    embed.send(msg.channel);
                    // msg.channel.createMessage(embed);
                }
            })
        }
    })
}

fnFirebase['rolar'] = (msg, parametros, idDiscord) =>{
    const _flags = [];
    const _atributos = ["fisico", "astucia","coordenacao","inteligencia","presenca","vontade"];
    let modificador = 0;
    let rolagem = NumeroAleatorio(1,100);
    let resposta = "";
    let minimoUp = 85;
    let dificuldade = parametros.filter(param => {
        // console.log(param.length);
        // console.log(param[0].toUpperCase());
        return (param.length < 5 && (param[0].toUpperCase() === "D" || param[0] === ">"));
    });

    console.log("Rolagem natural: " + rolagem);

    // console.log(dificuldade);

    if(dificuldade.length === 0)
    {
        dificuldade = 50;
    }
    else
    {
        parametros = parametros.filter(param => (param !== dificuldade[0]));
        dificuldade = dificuldade[0].substr(1);
        dificuldade = parseInt(dificuldade);
    }

    // console.log(parametros);

    resposta = "Resultado: ";
    if(parametros.length === 0)
    {
        Rolagem(msg, rolagem, dificuldade);
    }
    else
    {
        fbDb.ref("usuarios").once('value', snapshot => {
            const listaUsuarios = Object.values(snapshot.val());

            const dadosUsuario = listaUsuarios.filter(u => (u.idDiscord == idDiscord));

            if(dadosUsuario.length === 0)
            {
                msg.channel.createMessage("Usuário não vinculado à plataforma Draenak");
            }
            else
            {
                const idUsuario = dadosUsuario[0].id;
                const {fichaDiscord} = dadosUsuario[0];
                let {mesaDiscord} = dadosUsuario[0];

                if(mesaDiscord === undefined || mesaDiscord === null || mesaDiscord === "")
                {
                    mesaDiscord = "SM";
                }

                fbDb.ref('fichas/'+idUsuario+'/'+mesaDiscord+'/'+fichaDiscord).once('value',snapshot => {
                    const fichaSelecionada = snapshot.val();

                    if(fichaSelecionada === null || fichaSelecionada === undefined)
                    {
                        msg.channel.createMessage("Ficha não encontrada\nCertifique-se de que existe uma ficha ativa na mesa selecionada");
                    }
                    else
                    {
                        const {atributos, modulo} = fichaSelecionada;

                        parametros.forEach(parametro => {
                            let dadosParametro = parametro.split("+");
                            // let modificador;
                            // console.log(dadosParametro);
                            if(dadosParametro.length > 1)
                            {
                                parametro = dadosParametro[0].trim();
                                modificador = dadosParametro[1].trim();
                            }
                            else
                            {
                                dadosParametro = parametro.split("-");
                                if(dadosParametro.length > 1)
                                {
                                    parametro = dadosParametro[0].trim();
                                    modificador = "-"+dadosParametro[1].trim();
                                }
                            }

                            if(modificador !== null && modificador !== undefined && modificador != 0)
                            {
                                // console.log(modificador);
                                dadosParametro = modificador.split(">");
                                if(dadosParametro.length > 1)
                                {
                                    modificador = dadosParametro[0].trim();
                                    dificuldade = dadosParametro[1].trim();
                                }
                                modificador = parseInt(modificador);
                            }
                            else
                            {
                                dadosParametro = parametro.split(">");
                                if(dadosParametro.length > 1)
                                {
                                    parametro = dadosParametro[0].trim();
                                    dificuldade = dadosParametro[1].trim();
                                }
                            }

                            // console.log(parametro);

                            if(_atributos.includes(parametro))
                            {
                                //Significa que é uma rolagem de atributo
                                // console.log(atributos[parametro]);
                                modificador += parseInt(atributos[parametro][0]);
                                // rolagem += modificador;
                                Rolagem(msg, (rolagem+modificador), dificuldade,null,rolagem);
                                /* fbDb.ref('fichas/'+idUsuario+'/'+mesaDiscord+'/'+fichaDiscord+'/atributos/'+parametro).once('value', snapshot =>{
                                    const atributoSelecionado = snapshot.val();
                                    console.log(atributoSelecionado);
                                }) */
                            }
                            else
                            {
                                //Significa que é uma rolagem de Competência
                                if(rolagem > minimoUp)
                                {
                                    _flags.push("upa");
                                }
                                const atributoEscolhido = Object.values(_atributos).filter(_atr => {
                                    if(atributos[_atr].length > 1)
                                    {
                                        const _competencias = Object.keys(atributos[_atr][1]);
                                        return (_competencias.includes(parametro) || _competencias.includes(parametro+"°"));
                                        // console.log(_competencias);
                                    }

                                })

                                let valorParametro = 0;

                                // console.log("Mod: " + modificador);
                                if(atributoEscolhido.length > 0)
                                {
                                    //Significa que o personagem tem a Competência
                                    valorParametro = atributos[atributoEscolhido][1][parametro];
                                    if(valorParametro === undefined || valorParametro === null)
                                    {
                                        parametro += "°";
                                        valorParametro = atributos[atributoEscolhido][1][parametro];
                                    }
                                    // console.log(valorParametro);
                                    valorParametro = parseInt(valorParametro);
                                    valorParametro += parseInt(atributos[atributoEscolhido][0]);
                                    
                                    modificador += valorParametro;
                                    // console.log(modificador);
                                    Rolagem(msg, (rolagem+modificador),dificuldade,null,rolagem);
                                }
                                else
                                {
                                    //Não tem a competência e então preciso descobrir o atributo que ela deveria ser para dar o bônus

                                    fbDb.ref('modulos/' + modulo + '/competencias/').once('value', snapshot => {
                                        const listaGeral = snapshot.val();
                                        let achou = false;
                                        let nomeComp, nomeAtrib;
                                        let contadorAtrib = 0;
                                        let contadorComp = 0;
                                        let listaComp;
                                        
                                        while(!achou && contadorAtrib < _atributos.length)
                                        {
                                            listaComp = listaGeral[_atributos[contadorAtrib]];

                                            while(!achou && contadorComp < listaComp.length)
                                            {
                                                nomeComp = listaComp[contadorComp++].nome;
                                                // console.log(nomeComp);

                                                if(nomeComp === parametro || nomeComp === parametro+"°")
                                                {
                                                    nomeAtrib = _atributos[contadorAtrib];
                                                    achou = true;
                                                }
                                            }
                                            contadorComp = 0;
                                            contadorAtrib++;
                                        }

                                        if(nomeAtrib !== undefined && nomeAtrib !== null)
                                        {
                                            modificador += parseInt(atributos[nomeAtrib][0]);
                                        }
                                        else
                                        {
                                            msg.channel.createMessage("Não achei o atributo dessa Competência. Por favor verifique se escreveu o nome corretamente\nSegue rolagem sem bônus:");
                                        }

                                        Rolagem(msg, (rolagem+modificador), dificuldade);
                                    })
                                }

                                if(rolagem > minimoUp)
                                {
                                    valorParametro += 1;
                                    if(atributoEscolhido.length > 0)
                                    {
                                        atributos[atributoEscolhido][1][parametro] = valorParametro;
                                        // console.log("puff");
                                        UpaCompetencia(msg, idUsuario,mesaDiscord,fichaDiscord,atributos, {nome:parametro,valor:valorParametro});
                                    }
                                    else
                                    {
                                        const objCompetencia = {};
                                        fbDb.ref('modulos/'+modulo + '/competencias/').once('value',snapshot =>{
                                            const listaGeral = snapshot.val();
                                            let achou = false;
                                            let nomeComp, nomeAtrib;
                                            let contadorAtrib = 0;
                                            let contadorComp = 0;
                                            let listaComp;
                                            
                                            while(!achou && contadorAtrib < _atributos.length)
                                            {
                                                listaComp = listaGeral[_atributos[contadorAtrib]];

                                                while(!achou && contadorComp < listaComp.length)
                                                {
                                                    nomeComp = listaComp[contadorComp++].nome;
                                                    // console.log(nomeComp);

                                                    if(nomeComp === parametro || nomeComp === parametro+"°")
                                                    {
                                                        nomeAtrib = _atributos[contadorAtrib];
                                                        achou = true;
                                                    }
                                                }
                                                contadorComp = 0;
                                                contadorAtrib++;
                                            }

                                            if(atributos[nomeAtrib].length === 0)
                                            {
                                                objCompetencia[nomeComp] = 1;
                                                atributos[nomeAtrib].push(objCompetencia);
                                            }
                                            else
                                            {
                                                atributos[nomeAtrib][1][nomeComp] = 1;
                                            }
                                            
                                            UpaCompetencia(msg, idUsuario,mesaDiscord,fichaDiscord,atributos, {nome:nomeComp,valor:1});
                                        })
                                    }
                                }
                            }
                        })
                    }
                })
            }
        })
    }
}

fnFirebase['item'] = (msg, idDiscord, nomeItem, modQtd, descricao) =>{
    fbDb.ref("usuarios").once('value', snapshot =>{
        const listaUsuarios = Object.values(snapshot.val());

        const dadosUsuario = listaUsuarios.filter(u => (u.idDiscord == idDiscord));

        if(descricao === undefined)
        {
            descricao = null;
        }

        if(dadosUsuario.length === 0)
        {
            msg.channel.createMessage("Usuário não vinculado à plataforma Draenak");
            return;
        }

        const idUsuario = dadosUsuario[0].id;
        const {fichaDiscord} = dadosUsuario[0];
        let {mesaDiscord} = dadosUsuario[0];

        if(mesaDiscord === undefined || mesaDiscord === null || mesaDiscord === "")
        {
            mesaDiscord = "SM";
        }

        fbDb.ref('fichas/'+idUsuario+'/'+mesaDiscord+'/'+fichaDiscord).once('value',snapshot => {
            const fichaSelecionada = snapshot.val();
            let itemAlterado;

            if(fichaSelecionada === null || fichaSelecionada === undefined)
            {
                msg.channel.createMessage("Ficha não encontrada\nCertifique-se de que existe uma ficha ativa na mesa selecionada");
                return;
            }

            let {itens} = fichaSelecionada;
            let listaNomeItens = [];

            if(itens === null || itens === undefined)
            {
                itens = [];
            }

            itens.forEach(item => {
                listaNomeItens.push(item.nome);
            })

            //Após puxar lista de informações e colocar uma lista com os nomes dos itens que o personagem possui, procura se o item passado pelo usuário está nessa lista
            //Nessa pesquisa, procura-se saber o índice do item e, se ele não estiver na lista, retorna -1

            // console.log(nomeItem + " | " + modQtd + " | " + descricao);

            const indiceItem = listaNomeItens.findIndex(item => (item === nomeItem));

            if((descricao === null || descricao === undefined || descricao === "") && (modQtd === null || modQtd === undefined))
            {
                //Significa que é uma consulta para leitura
                if(indiceItem === -1)
                {
                    msg.channel.createMessage("Não achei " + nomeItem + " na ficha");
                }
                else
                {
                    itemAlterado = {...itens[indiceItem]};

                    if(itemAlterado.descricao === null || itemAlterado.descricao === undefined || itemAlterado.descricao === "")
                    {
                        msg.channel.createMessage("Sem descrição disponível");
                    }
                    else
                    {
                        msg.channel.createMessage(itemAlterado.descricao);
                    }
                }
            }
            else
            {
                if(isNaN(parseInt(modQtd)))
                {
                    modQtd = 0;
                }

                if(indiceItem === -1) //Ou seja, não encontrou nada
                {

                    if(modQtd < 0)
                    {
                        msg.channel.createMessage("Você já não possui " + nomeItem);
                        return;
                    }

                    if(modQtd === 0)
                    {
                        modQtd = 1;
                    }

                    itemAlterado = {
                        nome:nomeItem,
                        quantidade:modQtd,
                        descricao:descricao
                    };

                    itens.push(itemAlterado);
                }
                else
                {
                    itemAlterado = {...itens[indiceItem]};
                    itemAlterado.quantidade += modQtd;
                    itemAlterado.descricao = descricao;

                    if(itemAlterado.quantidade <= 0)
                    {
                        itens[indiceItem] = null
                    }
                    else
                    {
                        itens[indiceItem] = {...itemAlterado};
                    }
                }

                fbDb.ref('fichas/'+idUsuario+'/'+mesaDiscord+'/'+fichaDiscord).update({
                    itens:itens
                }).then(() => {
                    if(modQtd < 0)
                    {
                        msg.channel.createMessage(nomeItem + " removido em " + modQtd);
                    }
                    else if(modQtd > 0)
                    {
                        msg.channel.createMessage(nomeItem + " adicionado em " + modQtd);
                    }

                    if(descricao !== null && descricao !== undefined && descricao !== "")
                    {
                        msg.channel.createMessage("Descrição de " + nomeItem + " atualizada");
                    }
                }).catch(err => {
                    msg.channel.createMessage("Deu alguma coisa errada. Contate o criador");
                    console.warn(err);
                })
            }

            // console.log(nomeItem + " | " + modQtd + " | " + descricao);
            // console.log(listaNomeItens);
        })
    })
}

function Rolagem(msg, rolagem, dificuldade, nomeParametro, natural)
{
    let modificador;
    if(natural !== null && natural !== undefined)
    {
        natural = parseInt(natural);
        if(isNaN(natural))
        {
            natural = 0;
        }
        modificador = rolagem - natural;

        if(modificador > 0)
        {
            modificador = "+ " + modificador;
        }
        else if(modificador < 0)
        {
            modificador = "- " + Math.abs(modificador);
        }
    }
    let resposta = "Resultado: ";
    // console.log("Entrou rolagem");
    if(nomeParametro === null || nomeParametro === undefined)
    {
        nomeParametro = "";
    }

    if(nomeParametro.toUpperCase() !== "SIMPLES")
    {
        resposta += rolagem;
        
        if(modificador !== null && modificador !== undefined && modificador !== 0)
        {
            resposta += " *(**" + natural + "** " + modificador + ")*";
        }

        if(rolagem < dificuldade)
        {
            resposta += "\n**FALHA**";
        }
        else
        {
            resposta += "\n**ACERTO**";
        }
        resposta += " (Dificuldade " + dificuldade +")";
    }
    else
    {
        resposta += rolagem;
    }
    msg.channel.createMessage(resposta);
}

function UpaCompetencia(msg, idUsuario, idMesa, idFicha, atributos, parametro)
{
    // console.log("chamou");
    fbDb.ref('fichas/'+idUsuario+'/'+idMesa+'/'+idFicha).update({
        atributos:atributos
    }).then(() => {
        msg.channel.createMessage(parametro.nome + " agora está no nível " + parametro.valor);
    }).catch(err => {
        console.warn(err);
        // msg.channel.createMessage("Houve erro na evolução da competência");
    })
}

function NumeroAleatorio(min, max)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Capitalizar(str)
{
    return str[0].toUpperCase() + str.slice(1);
}

module.exports = fnFirebase;