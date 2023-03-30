const Sequelize = require('sequelize');
const db = require('./db.js');

const Notifications = db.define('notificacoes', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    titulo: {
        type: Sequelize.STRING,
        allowNull: false
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: false
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

//Criar a tabela
Notifications.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Notifications.sync({ alter: true })
//Exportar
module.exports = Notifications;
