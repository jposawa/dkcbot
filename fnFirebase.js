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
                    else
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

                    if(mesaEscolhida !== null && mesaEscolhida !== undefined)
                    {
                        const mesaDiscord = mesaEscolhida.id;

                        fbDb.ref('usuarios/' + idUsuario).update({
                            mesaDiscord:mesaDiscord
                        }).then(() => {
                            msg.channel.createMessage("Mesa **" + mesaEscolhida.nome + "** ativada com sucesso");
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
            const {mesaDiscord, fichaDiscord} = dadosUsuario[0]
            const idUsuario = dadosUsuario[0].id

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
            const {mesaDiscord} = dadosUsuario[0];
            
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
                            fichaDiscord:fichaDiscord
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
            const {mesaDiscord,fichaDiscord} = dadosUsuario[0];

            fbDb.ref('fichas/'+idUsuario+'/'+mesaDiscord+'/'+fichaDiscord).once('value', snapshot => {
                // console.log(snapshot);
                const fichaSelecionada = snapshot.val();
                // console.log(fichaSelecionada);

                if(fichaSelecionada === null || fichaSelecionada === undefined)
                {
                    msg.channel.createMessage("Ficha não encontrada\nCertifique-se de que existe uma ficha ativa");
                }
                else
                {
                    const {atributos,itens,tracos} = fichaSelecionada;
                    let mensagem = "**" + fichaSelecionada.nome + "**\n";
                    mensagem += "Pontos: " + fichaSelecionada.pontosGastos + "/" + fichaSelecionada.pontosTotais + "\n";
                    // console.log(fichaSelecionada);
                    console.log(filtro);
                    if(filtro !== undefined && filtro !== null)
                    {
                        filtro.forEach(filtro => {
                            filtro = filtro.toLowerCase();
                            switch(filtro)
                            {
                                case "atributos":
                                    mensagem += "\n**#ATRIBUTOS**\n";
                                    mensagem += "**F**ísico = " + atributos.fisico[0] + " | ";
                                    mensagem += "**C**oordenação = " + atributos.coordenacao[0] + "\n";
                                    mensagem += "**I**nteligência = " + atributos.inteligencia[0] + " | ";
                                    mensagem += "**A**stúcia = " + atributos.astucia[0] + "\n";
                                    mensagem += "**V**ontade = " + atributos.vontade[0] + " | ";
                                    mensagem += "**P**resença = " + atributos.presenca[0] + "\n";
                                break;

                                case "tracos":
                                    mensagem += "\n**#TRAÇOS**\n";
                                    tracos.forEach(traco => {
                                        mensagem += traco.nome + "\n";
                                    })
                                break;

                                case "competencias":
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
                                    itens.forEach(item => {
                                        mensagem += "\n" + item.quantidade + "x " + item.nome;
                                    }) 

                                    msg.channel.createMessage(mensagem);
                                break;

                                default:
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
                                    itens.forEach(item => {
                                        mensagem += "\n" + item.quantidade + "x " + item.nome;
                                    }) 
                                break;
                            }
                        })
                    }
                    else
                    {
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
                        itens.forEach(item => {
                            mensagem += "\n" + item.quantidade + "x " + item.nome;
                        })
                    }
                    
                    msg.channel.createMessage(mensagem);
                }
            })
        }
    })
}

function Capitalizar(str)
{
    return str[0].toUpperCase() + str.slice(1);
}

module.exports = fnFirebase;