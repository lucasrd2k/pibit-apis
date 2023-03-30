const Sequelize = require('sequelize');
const db = require('./db.js');

const Cardapio = db.define('cardapio', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    cafeDaManha: {
        type: Sequelize.STRING,
        allowNull: false
    },
    principais: {
        type: Sequelize.STRING,
        allowNull: false
    },
    lancheNoturno: {
        type: Sequelize.STRING,
        allowNull: false
    },
    dia: {
        type: Sequelize.STRING,
        allowNull: false
    },
    id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
});


//Criar a tabela
Cardapio.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Cardapio.sync({ alter: true })
//Exportar
module.exports = Cardapio;
