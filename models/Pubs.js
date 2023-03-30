const Sequelize = require('sequelize');
const db = require('./db.js');

const Pubs = db.define('publicacoes', {
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
    imagem: {
        type: Sequelize.STRING,
        allowNull: false
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

//Criar a tabela
Pubs.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Pubs.sync({ alter: true })
//Exportar
module.exports = Pubs;
