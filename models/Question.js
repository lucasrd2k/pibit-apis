const Sequelize = require('sequelize');
const db = require('./db.js');

const Question = db.define('pergunta', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true
    },
    texto: {
        type: Sequelize.STRING,
        allowNull: false
    },
    tipo: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    respostas: {
        type: Sequelize.STRING,
        allowNull: true
    },
    pesquisa: { //com relação a pesquisa
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
            model: 'pesquisa',
            key: 'id'
        }
    }
});

//Criar a tabela
Question.sync();
//Verificar se há alguma diferença na tabela, realiza a alteração
//Question.sync({ alter: true })
//Exportar
module.exports = Question;

