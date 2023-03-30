const Sequelize = require('sequelize');
const db = require('./db.js');

const Comidas = db.define('comidas', {
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
Comidas.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Comidas.sync({ alter: true })
//Exportar
module.exports = Comidas;