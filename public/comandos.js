const comandoPorNome = {};

comandoPorNome['sobre'] = (msg, args) => {
    msg.channel.send("Sou apenas um bot para auxiliar a jogar Draenak");
    msg.channel.send("Para criar sua ficha acesse https://dkc.netlify.app/");
    // return msg.channel.createMessage("Sou apenas um bot para auxiliar a jogar Draenak");
}