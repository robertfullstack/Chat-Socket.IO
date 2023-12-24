const app = require('express')();

const http = require('http').createServer(app);

const io = require('socket.io')(http);

var usuarios = [];
var socketIds = [];

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    socket.on('new user', function (data) {
        // O código está ouvindo o evento 'new user' em um socket(tomada).
        // Quando esse evento ocorre, a função passada como segundo argumento é executada. 
        // A variável data contém os dados associados a este evento, que é enviada pelo cliente que emitiu o evento.
        if (usuarios.indexOf(data) != -1) {
            // O código verifica se o valor contido em 'data' já existe no array 'usuarios'.
            // O método 'indexOf' retorna o índice do primeiro elemento do array ou -1 se não tiver nenhum valor presente.
            // -1 Significa que ele não existe.
            socket.emit('new user', { success: false })
            // Aqui se o usuário já existir (o valor da 'data' já existe no 'array'), desse modo, o servidor emite o evento 'new user' com um objeto.
            // E seu objeto é {success: false} tando mal-sucedida. Então significa que ele não é um novo usuário, pois ele já existem (está dentro do array).
        } else {
            usuarios.push(data)
            // Como o usuário não existe, ele vai ser adicionado no array usuarios.
            // Ou seja, um novo usuário foi registrado no sistema.
            socketIds.push(socket.id)
            // Foi adicionado também o ID, desse usuário no array socketIds.
            // Útil para rastrear conexões individuais.

            socket.emit('new user', { success: true })
            // A mensagem de volta para o evento 'new user' vai ser retornada. Pois agora sim existe um novo usuário.
        }
    })

    socket.on('chat message', (obj) => {
        if (usuarios.indexOf(obj.nome) != -1 && usuarios.indexOf(obj.nome) == socketIds.indexOf(socket.id)) {
            // Aqui ocorre 3 verificações: 
            // 1 - Se o nome quando enviada no front end, verifica se o usuário existe.
            // Sendo ele -1.
            // 2,3 - Verificando se o socket ID dele, corresponde ao mesmo indice dele no array.
            io.emit('chat message', obj)
        } else {
            console.log('Erro: Você não tem acesso para executar a ação.')
        }
    })


    socket.on('disconnect', () => {
        let id = socketIds.indexOf(socket.id)
        let disconnectedUser = usuarios[id];
        socketIds.splice(id, 1)
        usuarios.splice(id, 1)
        console.log("Lista de IDs conectados: " + socketIds)
        console.log("Lista de usuários: " + usuarios)
        console.log('O usuário ' + disconnectedUser + ' saiu do chat')
    })
})



http.listen(3000, () => {

    console.log('listening on *:3000');

});