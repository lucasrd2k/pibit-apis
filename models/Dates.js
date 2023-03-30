//Compare this snippet to User.js
const Sequelize = require('sequelize');
const db = require('./db.js');

const Dates = db.define('datas', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    data: {
        type: Sequelize.DATE,
        allowNull: false
    },
    hora: {
        type: Sequelize.TIME,
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
Dates.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Dates.sync({ alter: true })
//Exportar
module.exports = Dates;
