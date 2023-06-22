const Sequelize = require('sequelize');
const db = require('./db.js');

const Search = db.define('pesquisa', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    nome: {
        type: Sequelize.STRING,
        allowNull: false
    },
    amostra: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    descricao: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tcle: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    tale: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    nomes: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    telefones: {
        type: Sequelize.STRING,
        allowNull: false
    },
    emails: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    endereco: {
        type: Sequelize.STRING,
        allowNull: false
    },
    usuario: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

//Criar a tabela
// Search.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
Search.sync({ alter: true })

module.exports = Search;