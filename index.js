const express = require('express');
const app = express();
const port = 3000;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Dates = require('./models/Dates');
const Dates = require('./models/Notification');
const Dates = require('./models/Pubs');
const Dates = require('./models/Comidas');
const jwtKey = 'appre_versao_1.0.0_key_dev';
// Path: index.js

//Criar middleware pra validar as requisições com jwt
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(200).json({ error: true, message: 'Token não fornecido' });
    }
    const parts = authHeader.split(' ');
    if (!parts.length === 2) {
        return res.status(200).json({ error: true, message: 'Token inválido' });
    }
    const [scheme, token] = parts;
    if (!/^Bearer$/i.test(scheme)) {
        return res.status(200).json({ error: true, message: 'Token inválido: os tokens geralmente tem o formato: Bearer $token' });
    }
    jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
            return res.status(200).json({ error: true, message: 'Token inválido' });
        }
        req.userId = decoded.userId;
        return next();
    });
}






// Routes: registro, login, perfil, datas/:mês, publicações, criar publicação

// Rota de registro usando o método POST
app.post("/registro", async (request, response) => {
    const { nome, matricula, senha, foto } = request.body;
    //Gerar bcrypt
    const hashSenha = await bcrypt.hash(senha, 2);
    try {
        const user = await User.create({
            nome: nome,
            matricula: matricula,
            senha: hashSenha,
            foto: foto
        });
        // Gerando o JWT
        const token = jwt.sign({ userId: user._id }, jwtKey, { expiresIn: '1h' });
        response.status(201).json({
            id: user.id,
            nome: user.nome,
            token: token
        });
    } catch (error) {
        response.status(200).send({ error: true, message: "Erro criando usuario" });
    }
});
// login
app.post("/login", async (req, res) => {
    const { matricula, senha } = req.body;
    try {
        const user = await User.findOne({
            where: {
                matricula: matricula
            }
        });
        if (!user || user == null) {
            return res.status(200).json({
                error: true,
                message: "Usuário não encontrado!"
            });
        }
        try {
            const eValido = await bcrypt.compare(senha, user.senha);
            if (eValido) {
                console.log('Senha válida');
                const tokenLogin = jwt.sign({ userId: user._id }, jwtKey, { expiresIn: '1h' });
                res.status(200).json({
                    id: user.id,
                    nome: user.nome,
                    token: tokenLogin,
                });
            }
            else {
                return res.status(200).json({
                    error: true,
                    message: "Senha inválida!"
                });
            }
        } catch {
            return res.status(200).json({
                error: true,
                message: "Senha inválida!"
            });
        }
    } catch (error) {
        return res.status(200).json({
            error: true,
            message: "Erro ao logar!"
        });
    }
});
// perfil
app.get("/perfil/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const userPerfil = await User.findOne({
            where: {
                id: id
            }
        });
        if (!userPerfil || userPerfil == null) {
            return res.status(200).json({
                error: true,
                message: "Usuário não encontrado!"
            });
        }
        res.status(200).json({
            id: userPerfil.id,
            nome: userPerfil.nome,
            matricula: userPerfil.matricula,
            foto: userPerfil.foto
        });
    } catch (error) {
        return res.status(200).json({
            error: true,
            message: "Erro ao buscar perfil!"
        });
    }
});

// datas - cadastro post
app.post("/datas", authMiddleware, async (req, res) => {
    const { data, hora, descricao, id } = req.body;
    try {
        const dataUser = await Dates.create({
            data: data,
            hora: hora,
            descricao: descricao,
            id_usuario: id
        });
        res.status(201).json({
            id: dataUser.id,
            data: dataUser.data,
            hora: dataUser.hora,
            descricao: dataUser.descricao,
            id_usuario: dataUser.id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar data!"
        });
    }
});
// datas/:mês - get
app.get("/datas/:mes", authMiddleware, async (req, res) => {
    const { mes } = req.params;
    try {
        const datasUser = await Dates.findAll({
            where: {
                data: {
                    [Op.like]: '%' + mes + '%'
                }
            }
        });
        res.status(200).json({
            datasUser
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar datas!"
        });
    }
});

// publicações - cadastro post
app.post("/publicacoes", authMiddleware, async (req, res) => {
    const { titulo, descricao, imagem, id } = req.body;
    try {
        const publicacao = await Publicacao.create({
            titulo: titulo,
            descricao: descricao,
            imagem: imagem,
            id_usuario: id
        });
        res.status(201).json({
            id: publicacao.id,
            titulo: publicacao.titulo,
            descricao: publicacao.descricao,
            imagem: publicacao.imagem,
            id_usuario: publicacao.id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar publicação!"
        });
    }
});

//Publicações por id_usuario
app.get("/publicacoes/:id", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const publicacoes = await Publicacao.findAll({
            where: {
                id_usuario: id
            }
        });
        res.status(200).json({
            publicacoes
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar publicações!"
        });
    }
});

// Enviar notificação
app.post("/notificacao", authMiddleware, async (req, res) => {
    const { titulo, descricao, id } = req.body;
    try {
        const notificacao = await Notifications.create({
            titulo: titulo,
            descricao: descricao,
            id_usuario: id
        });
        res.status(201).json({
            id: notificacao.id,
            titulo: notificacao.titulo,
            descricao: notificacao.descricao,
            id_usuario: notificacao.id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao enviar notificação!"
        });
    }
});

// Notificações
app.get("/notificacao", authMiddleware, async (req, res) => {
    try {
        const notificacoes = await Notifications.findAll();
        res.status(200).json({
            notificacoes
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar notificações!"
        });
    }
});

//Cadastrar comidas
app.post("/comidas", authMiddleware, async (req, res) => {
    const { nome, descricao, imagem, id } = req.body;
    try {
        const comida = await Comidas.create({
            nome: nome,
            descricao: descricao,
            imagem: imagem,
            id_usuario: id
        });
        res.status(201).json({
            id: comida.id,
            nome: comida.nome,
            descricao: comida.descricao,
            imagem: comida.imagem,
            id_usuario: comida.id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar comida!"
        });
    }
});

//Comidas
app.get("/comidas", authMiddleware, async (req, res) => {
    try {
        const comidas = await Comidas.findAll();
        res.status(200).json({
            comidas
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar comidas!"
        });
    }
});

//Comidas search
app.get("/comidas/:nome", authMiddleware, async (req, res) => {
    const { nome } = req.params;
    try {
        const comidas = await Comidas.findAll({
            where: {
                nome: {
                    [Op.like]: '%' + nome + '%'
                }
            }
        });
        res.status(200).json({
            comidas
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar comidas!"
        });
    }
});

//Cadastrar cardápio
app.post("/cardapio", authMiddleware, async (req, res) => {
    const { cafeDaManha, principais, lancheNoturno, dia, id } = req.body;
    try {
        const cardapio = await Cardapio.create({
            cafeDaManha: cafeDaManha,
            principais: principais,
            lancheNoturno: lancheNoturno,
            dia: dia,
            id_usuario: id
        });
        res.status(201).json({
            id: cardapio.id,
            cafeDaManha: cardapio.cafeDaManha,
            principais: cardapio.principais,
            lancheNoturno: cardapio.lancheNoturno,
            dia: cardapio.dia,
            id_usuario: cardapio.id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar cardápio!"
        });
    }
});

//Cardápio
app.get("/cardapio/:dia", authMiddleware, async (req, res) => {
    const { dia } = req.params;
    try {
        const cardapio = await Cardapio.findAll({
            where: {
                dia: dia
            }
        });
        //Separar os ids recebidos em cada refeição e consultar na tabela de comidas
        // const cafeDaManha = 1,2,3,7
        // const principais = 4,5,6
        // const lancheNoturno = 8,9,10
        //Café da manhã - 1,2,3,7
        const cafeDaManha = cardapio.map((item) => {
            return item.cafeDaManha;
        });
        const cafeDaManhaArray = cafeDaManha.toString().split(",");
        var comidasCafeDaManha = [];
        for (let i = 0; i < cafeDaManhaArray.length; i++) {
            let comidadoID = await Comidas.findAll({
                where: {
                    id: cafeDaManhaArray[i]
                }
            });
            comidasCafeDaManha.push(comidadoID);
            console.log(comidadoID);
        }
        //Principais - 4,5,6
        const principais = cardapio.map((item) => {
            return item.principais;
        });
        const principaisArray = principais.toString().split(",");
        var comidasPrincipais = [];
        for (let i = 0; i < principaisArray.length; i++) {
            let comidadoID = await Comidas.findAll({
                where: {
                    id: principaisArray[i]
                }
            });
            comidasPrincipais.push(comidadoID);
            console.log(comidadoID);
        }
        //Lanche noturno - 8,9,10
        const lancheNoturno = cardapio.map((item) => {
            return item.lancheNoturno;
        }
        );
        const lancheNoturnoArray = lancheNoturno.toString().split(",");
        var comidasLancheNoturno = [];
        for (let i = 0; i < lancheNoturnoArray.length; i++) {
            let comidadoID = await Comidas.findAll({
                where: {
                    id: lancheNoturnoArray[i]
                }
            });
            comidasLancheNoturno.push(comidadoID);
            console.log(comidadoID);
        }
        res.status(200).json({
            comidasCafeDaManha,
            comidasPrincipais,
            comidasLancheNoturno
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar cardápio!"
        });
    }
});

//Termo de consentimento/avaliação - segunda versão

//rodar api
app.listen(3000, () => {
    console.log("API rodando no endereço http://localhost:3000");
});


