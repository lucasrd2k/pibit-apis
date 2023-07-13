const Sequelize = require('sequelize');
const db = require('./db.js');

const Response = db.define('resposta', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    resposta: {
        type: Sequelize.STRING,
        allowNull: false
    },
    pergunta: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'pergunta',
            key: 'id'
        }
    },
    usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'usuario',
            key: 'id'
        }
    }
});

//Criar a tabela
Response.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Response.sync({ alter: true })
//Exportar
module.exports = Response;

