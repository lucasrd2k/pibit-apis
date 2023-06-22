const express = require('express');
const app = express();

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Dates = require('./models/Dates');
const Notification = require('./models/Notification');
const Pubs = require('./models/Pubs');
const Comidas = require('./models/Comidas');
const Cardapio = require('./models/Cardapio');
const jwtKey = 'appre_versao_1.0.0_key_dev';
const jwtKey2 = 'appre_versao_1.0.0_key_dev2';
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { Op, Sequelize } = require("sequelize");
app.use(cors());
app.use(express.json());

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
};

const authMiddleware2 = (req, res, next) => { //middleware para verificar se o usuário é admin
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
    jwt.verify(token, jwtKey2, (err, decoded) => {
        if (err) {
            return res.status(200).json({ error: true, message: 'Token inválido' });
        }
        req.userId = decoded.userId;
        return next();
    });
};
// Routes: registro, login, perfil, datas/:mês, publicações, criar publicação

// Rota de registro usando o método POST
app.post("/registro", async (request, response) => {
    const { nome, matricula, email, senha, foto } = request.body;
    //Gerar bcrypt
    const notify = true;
    const hashSenha = await bcrypt.hash(senha, 2);
    //Processar o base64 da imagem
    let fileName = 'uploads/default.png';
    if (foto) {
        const buffer = new Buffer.from(foto.split(',')[1], 'base64');
        const $extension = foto.split(';')[0].split('/')[1];
        if ($extension != 'jpeg' && $extension != 'png' && $extension != 'jpg') {
            return res.status(200).json({
                error: true,
                message: "Formato de imagem inválido!"
            });
        }
        fileName = `${new Date().getTime()}.${$extension}`;
        const filePath = path.join(__dirname, 'uploads', fileName);

        fs.writeFileSync(filePath, buffer);
    }


    try {
        const user = await User.create({
            nome: nome,
            matricula: matricula,
            email: email,
            senha: hashSenha,
            foto: fileName,
            notify: notify
        });
        // Gerando o JWT
        const token = jwt.sign({ userId: user._id }, jwtKey, { expiresIn: '168h' });
        response.status(201).json({
            id: user.id,
            nome: user.nome,
            token: token
        });
    } catch (error) {
        response.status(200).send({ error: true, message: "Erro criando usuario" + error });
    }
});
// login
app.post("/login", async (req, res) => {
    const { matricula, senha } = req.body;
    try {
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { matricula: matricula },
                    { email: matricula }
                ]
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
                const tokenLogin = jwt.sign({ userId: user._id }, jwtKey, { expiresIn: '168h' });
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
            message: "Erro ao logar! " + error
        });
    }
});

app.post("/loginAdm", async (req, res) => {
    const { matricula, senha } = req.body;
    try {
        //login por matricula ou e-mail
        const user = await User.findOne({
            where: {
                [Op.or]: [
                    { matricula: matricula },
                    { email: matricula }
                ]
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
                const tokenLogin = jwt.sign({ userId: user._id }, jwtKey2, { expiresIn: '168h' });
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
            message: "Erro ao logar! " + error
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
        const filePath = path.join(__dirname, userPerfil.foto);
        const file = fs.readFileSync(filePath);
        const fileBase64 = new Buffer.from(file).toString('base64');
        res.status(200).json({
            id: userPerfil.id,
            nome: userPerfil.nome,
            matricula: userPerfil.matricula,
            foto: fileBase64,
            notify: userPerfil.notify
        });
    } catch (error) {
        return res.status(200).json({
            error: true,
            message: "Erro ao buscar perfil!" + error
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
            message: "Erro ao cadastrar data!" + error
        });
    }
});
// datas/:mês - get

app.get("/datas/:mes/user/:id", authMiddleware, async (req, res) => {
    let { mes, id } = req.params;
    //Verificar se o tem 1 digito
    if (mes.length == 1) {
        mes = '0' + mes;
    }

    try {
        const datasUser = await Dates.findAll({
            where: {
                id_usuario: id, // substitua 'id' pelo ID do usuário desejado
                [Sequelize.Op.and]: [
                    Sequelize.where(Sequelize.fn('MONTH', Sequelize.col('data')), mes)
                ]
            }
        });

        res.status(200).json({
            error: false,
            datas: datasUser
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar datas!" + error
        });
    }
});


// publicações - cadastro post
app.post("/publicacoes", authMiddleware2, async (req, res) => {
    const { titulo, descricao, imagem, id } = req.body;
    try {
        let fileName = 'uploads/default2.jpeg';
        if (imagem) {
            const foto = imagem;
            const buffer = new Buffer.from(foto.split(',')[1], 'base64');
            const $extension = foto.split(';')[0].split('/')[1];
            if ($extension != 'jpeg' && $extension != 'png' && $extension != 'jpg') {
                return res.status(200).json({
                    error: true,
                    message: "Formato de imagem inválido!"
                });
            }
            fileName = `${new Date().getTime()}.${$extension}`;
            const filePath = path.join(__dirname, 'uploads', fileName);

            fs.writeFileSync(filePath, buffer);
        }
        const publicacao = await Pubs.create({
            titulo: titulo,
            descricao: descricao,
            imagem: fileName,
            id_usuario: id
        });
        res.status(201).json({
            id: publicacao.id,
            titulo: publicacao.titulo,
            descricao: publicacao.descricao,
            imagem: publicacao.imagem,
            id_usuario: id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar publicação!"
        });
    }
});

//Publicações por id_usuario
app.get("/publicacoes/:search", authMiddleware, async (req, res) => {
    const { search } = req.params;
    try {
        const publicacoes = await Pubs.findAll({ //filtar por titulo ou descrição com like
            where: {
                [Op.or]: [
                    {
                        titulo: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        descricao: {
                            [Op.like]: `%${search}%`
                        }
                    }
                ]
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

//Todas as publicações
app.get("/publicacoes", authMiddleware, async (req, res) => {
    try {
        let publicacoes = await Pubs.findAll();
        //Percorrer trocando o caminho da imagem por base64
        for (let i = 0; i < publicacoes.length; i++) {
            const filePath = path.join(__dirname, publicacoes[i].imagem);
            const file = fs.readFileSync(filePath);
            //Converter a imagem para base64
            const fileBase64 = new Buffer.from(file).toString('base64');
            publicacoes[i].imagem = fileBase64;
        }
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
app.post("/notificacao", authMiddleware2, async (req, res) => {
    const { titulo, descricao, id } = req.body;
    try {
        const notificacao = await Notification.create({
            titulo: titulo,
            descricao: descricao,
            id_usuario: id
        });
        res.status(201).json({
            id: notificacao.id,
            titulo: notificacao.titulo,
            descricao: notificacao.descricao
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
        const notificacoes = await Notification.findAll();
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
app.post("/comidas", authMiddleware2, async (req, res) => {
    const { nome, descricao, imagem, id } = req.body;
    let fileName = 'uploads/default2.jpeg';
    if (imagem) {
        const foto = imagem;
        const buffer = new Buffer.from(foto.split(',')[1], 'base64');
        const $extension = foto.split(';')[0].split('/')[1];
        if ($extension != 'jpeg' && $extension != 'png' && $extension != 'jpg') {
            return res.status(200).json({
                error: true,
                message: "Formato de imagem inválido!"
            });
        }
        fileName = `${new Date().getTime()}.${$extension}`;
        const filePath = path.join(__dirname, 'uploads', fileName);

        fs.writeFileSync(filePath, buffer);
    }
    try {
        const comida = await Comidas.create({
            nome: nome,
            descricao: descricao,
            imagem: fileName,
            id_usuario: id
        });
        res.status(201).json({
            id: comida.id,
            nome: comida.nome,
            descricao: comida.descricao,
            imagem: comida.imagem,
            id_usuario: id
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar comida!" + error
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
app.post("/cardapio", authMiddleware2, async (req, res) => {
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
            id_usuario: id
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

        const cafeDaManha = cardapio.map((item) => {
            return item.cafeDaManha;
        });
        const cafeDaManhaArray = cafeDaManha.toString().split(",");
        var comidasCafeDaManha = [];
        for (let i = 0; i < cafeDaManhaArray.length; i++) {
            let comida = await Comidas.findAll({
                where: {
                    id: cafeDaManhaArray[i]
                }
            });
            comidasCafeDaManha.push(...comida); // Here we use the spread operator
        }

        const principais = cardapio.map((item) => {
            return item.principais;
        });
        const principaisArray = principais.toString().split(",");
        var comidasPrincipais = [];
        for (let i = 0; i < principaisArray.length; i++) {
            let comida = await Comidas.findAll({
                where: {
                    id: principaisArray[i]
                }
            });
            comidasPrincipais.push(...comida); // Same here
        }

        const lancheNoturno = cardapio.map((item) => {
            return item.lancheNoturno;
        });
        const lancheNoturnoArray = lancheNoturno.toString().split(",");
        var comidasLancheNoturno = [];
        for (let i = 0; i < lancheNoturnoArray.length; i++) {
            let comida = await Comidas.findAll({
                where: {
                    id: lancheNoturnoArray[i]
                }
            });
            comidasLancheNoturno.push(...comida); // And here
        }
        //Percorrer os arrays transformando os caminhos em base64 da imagem
        for (let i = 0; i < comidasCafeDaManha.length; i++) {
            const filePath = path.join(__dirname, comidasCafeDaManha[i].imagem);
            //Ler a imagem
            const file = fs.readFileSync(filePath);
            //Converter a imagem para base64
            const fileBase64 = new Buffer.from(file).toString('base64');
            // const fileExtension = path.extname(filePath).substring(1);
            // const fileComplete = `data:image/${fileExtension};base64,${fileBase64}`;
            //Atribuir o valor da imagem convertida para o objeto
            comidasCafeDaManha[i].imagem = fileBase64;
        }
        for (let i = 0; i < comidasPrincipais.length; i++) {
            const filePath = path.join(__dirname, comidasPrincipais[i].imagem);
            //Ler a imagem
            const file = fs.readFileSync(filePath);
            //Converter a imagem para base64
            const fileBase64 = new Buffer.from(file).toString('base64');
            // const fileExtension = path.extname(filePath).substring(1);
            // const fileComplete = `data:image/${fileExtension};base64,${fileBase64}`;
            //Atribuir o valor da imagem convertida para o objeto
            comidasPrincipais[i].imagem = fileBase64;
        }
        for (let i = 0; i < comidasLancheNoturno.length; i++) {
            const filePath = path.join(__dirname, comidasLancheNoturno[i].imagem);
            //Ler a imagem
            //Ler a imagem
            const file = fs.readFileSync(filePath);
            //Converter a imagem para base64
            const fileBase64 = new Buffer.from(file).toString('base64');
            // const fileExtension = path.extname(filePath).substring(1);
            // const fileComplete = `data:image/${fileExtension};base64,${fileBase64}`;
            //Atribuir o valor da imagem convertida para o objeto
            comidasLancheNoturno[i].imagem = fileBase64;
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

const Search = require("./models/Search");
//Cadastro de pesquisa
// nome
// amostra
// descricao
// tcle
// tale
// nomes
// telefones
// emails
// endereco
// usuario
app.post("/pesquisa", authMiddleware2, async (req, res) => {
    const { nome, amostra, descricao, tcle, tale, nomes, telefones, emails, endereco, usuario } = req.body;
    try {
        const pesquisa = await Search.create({
            nome: nome,
            amostra: amostra,
            descricao: descricao,
            tcle: tcle,
            tale: tale,
            nomes: nomes,
            telefones: telefones,
            emails: emails,
            endereco: endereco,
            usuario: usuario
        });
        res.status(201).json(
            pesquisa
        );

    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar pesquisa!" + error
        });
    }
});

//Listar pesquisas
app.get("/pesquisa", authMiddleware, async (req, res) => {
    //retornar a última pesquisa cadastrada
    try {
        const pesquisa = await Search.findAll({
            limit: 1,
            order: [['createdAt', 'DESC']]
        });
        res.status(200).json({
            pesquisa
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar pesquisa!" + error
        });
    }
});

//Cadastro de questões
const Question = require("./models/Question");
// texto
// tipo
// respostas
// pesquisa
app.post("/questao", authMiddleware2, async (req, res) => {
    const { texto, tipo, respostas, pesquisa } = req.body;
    try {
        const questao = await Question.create({
            texto: texto,
            tipo: tipo,
            respostas: respostas,
            pesquisa: pesquisa
        });
        res.status(201).json({
            id: questao.id,
            texto: questao.texto,
            tipo: questao.tipo,
            respostas: questao.respostas,
            pesquisa: questao.pesquisa
        });

    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao cadastrar questão!" + error
        });
    }
});

// pesquisa/:id/perguntas
app.get("/pesquisa/:id/perguntas", authMiddleware, async (req, res) => {
    const { id } = req.params;
    try {
        const questoes = await Question.findAll({
            where: {
                pesquisa: id
            }
        });
        res.status(200).json({
            error: false,
            perguntas: questoes
        });
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao buscar questões!" + error
        });
    }
});

//rota pra alterar notify
app.put("/notify", authMiddleware, async (req, res) => {
    const { id } = req.body;
    try {
        const usuario = await User.findByPk(id);
        if (usuario) {
            if (usuario.notify == true) {
                usuario.notify = false;
            }
            else {
                usuario.notify = true;
            }
            await usuario.save();
            res.status(200).json({
                error: false,
                message: "Notificação alterada com sucesso!"
            });
        }
        else {
            res.status(200).json({
                error: true,
                message: "Usuário não encontrado!"
            });
        }
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao alterar notificação!" + error
        });
    }
});

//Edição de usuário (nome, email, matricula, foto)
app.put("/usuario", authMiddleware, async (req, res) => {
    const { id, nome, email, matricula, foto } = req.body;
    try {
        const usuario = await User.findByPk(id);
        if (usuario) { 
            if (nome !== undefined) usuario.nome = nome;
            if (email !== undefined) usuario.email = email;
            if (matricula !== undefined) usuario.matricula = matricula;
            if (foto){
                //converter o base64 para imagem
                const file = new Buffer.from(foto, 'base64');
                //salvar a imagem
                const filePath = path.join(__dirname, 'uploads', `usuario${usuario.id}.jpg`);
                fs.writeFile(filePath, file, async (err) => {
                    if (err) {
                        console.log(err);
                    }
                }
                );
                //Atribuir o valor da imagem convertida para o objeto
                const fileEnd = "uploads/usuario" + usuario.id + ".jpg";
                usuario.foto = fileEnd;
            }
            await usuario.save();
            res.status(200).json({
                error: false,
                message: "Usuário alterado com sucesso!"
            });
        }
        else {
            res.status(200).json({
                error: true,
                message: "Usuário não encontrado!"
            });
        }
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao alterar usuário!" + error
        });
    }
});
//nodemailer
const nodemailer = require('nodemailer');
app.post('/recuperar-senha', async (req, res) => {
    const { identificador } = req.body;

    try {
        // Localiza o usuário no banco de dados (Ajuste conforme seu modelo de usuário)
        const usuario = await User.findOne({ 
            where: { [Op.or]: [{ email: identificador }, { matricula: identificador }] }
        });

        if (usuario) {
            // Gera 3 números aleatórios e cria a hash
            const numeros = [Math.floor(Math.random() * 100), Math.floor(Math.random() * 100), Math.floor(Math.random() * 100)];
            const saltRounds = 10;
            const hashed = await bcrypt.hash(numeros.join(''), saltRounds);

            // Configura o Nodemailer
            const transporter = nodemailer.createTransport({
                host: 'smtp-relay.sendinblue.com',
                port: 587,
                auth: {
                    user: 'lucasrdias51@gmail.com',
                    pass: 'KrtfanhWHARMLIF4'
                }
            });

            // Envia o e-mail
            await transporter.sendMail({
                from: 'naoresponder@reifgoiano.edu.br',
                to: usuario.email,
                subject: 'Recuperação de senha',
                text: `Seus números são: ${numeros.join(', ')}`,
                html: `<b>Seus números são: ${numeros.join(', ')}</b>`
            });

            // Retorna a hash
            res.status(200).json({ 
                error: false,
                hash: hashed 
            });
        } else {
            res.status(400).json({ 
                error: true,
                message: 'Usuário não encontrado!'
            });
        }
    } catch (error) {
        res.status(500).json({ error: 'Erro ao recuperar a senha!'+error });
    }
});


//Alterar senha
app.put("/senha", authMiddleware, async (req, res) => {
    const { id, senha, codigo, hash } = req.body;
    try {
        const usuario = await User.findByPk(id);
        if (usuario) {
            // Verifica se o código é válido
            const valid = await bcrypt.compare(codigo, hash);
            if (valid) {
                // Altera a senha
                const saltRounds = 10;
                const hashed = await bcrypt.hash(senha, saltRounds);
                usuario.senha = hashed;
                await usuario.save();
                res.status(200).json({
                    error: false,
                    message: "Senha alterada com sucesso!"
                });
            } else {
                res.status(400).json({
                    error: true,
                    message: "Código inválido!"
                });
            }
        }
        else {
            res.status(200).json({
                error: true,
                message: "Usuário não encontrado!"
            });
        }
    } catch (error) {
        res.status(200).json({
            error: true,
            message: "Erro ao alterar senha!" + error
        });
    }
});




//Termo de consentimento/avaliação - segunda versão

//rodar api
app.listen(3400, () => {
    console.log("API rodando no endereço http://localhost:3000");
});

