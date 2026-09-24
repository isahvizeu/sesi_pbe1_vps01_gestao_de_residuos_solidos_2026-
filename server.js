const express = require("express");
const fs = require("fs");

const app = express();
const PORTA = 3000;
const ARQUIVO = "dados.json";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("client"));

function lerDados() {
    const dados = fs.readFileSync(ARQUIVO, "utf-8");
    return JSON.parse(dados);
}
function salvarDados(dados) {
    fs.writeFileSync(
        ARQUIVO,
        JSON.stringify(dados, null, 4)
    );
}
app.get("/ocorrencias", (req, res) => {
    const ocorrencias = lerDados();
    res.status(200).json(ocorrencias);
});
app.get("/ocorrencias/:id", (req, res) => {
    const ocorrencias = lerDados();
    const id = Number(req.params.id);
    const ocorrencia = ocorrencias.find(
        item => item.id === id
    );
    if (!ocorrencia) {
        return res.status(404).json({
            mensagem: "Ocorrência não encontrada."
        });
    }
    res.status(200).json(ocorrencia);
});
app.get("/buscar/local/:local", (req, res) => {
    const ocorrencias = lerDados();
    const local = req.params.local.toLowerCase();
    const resultado = ocorrencias.filter(item =>
        item.local.toLowerCase().includes(local)
    );
    res.status(200).json(resultado);
});
app.get("/buscar/tipo/:tipo", (req, res) => {
    const ocorrencias = lerDados();
    const tipo = req.params.tipo.toLowerCase();
    const resultado = ocorrencias.filter(item =>
        item.tipo_residuo.toLowerCase().includes(tipo)
    );
    res.status(200).json(resultado);
});
app.post("/ocorrencias", (req, res) => {
    const ocorrencias = lerDados();
    const novaOcorrencia = req.body;
    if (
        !novaOcorrencia.local ||
        !novaOcorrencia.tipo_residuo ||
        !novaOcorrencia.nivel_risco ||
        !novaOcorrencia.data_registro ||
        !novaOcorrencia.status
    ) {
        return res.status(400).json({
            mensagem: "Todos os campos são obrigatórios."
        });
    }
    const novoId = ocorrencias.length > 0
        ? Math.max(...ocorrencias.map(item => item.id)) + 1
        : 1;

    novaOcorrencia.id = novoId;
    ocorrencias.push(novaOcorrencia);
    salvarDados(ocorrencias);
    res.status(201).json({
        mensagem: "Ocorrência cadastrada com sucesso.",
        ocorrencia: novaOcorrencia
    });
});
app.put("/ocorrencias/:id", (req, res) => {
    const ocorrencias = lerDados();
    const id = Number(req.params.id);
    const indice = ocorrencias.findIndex(
        item => item.id === id
    );
    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Ocorrência não encontrada."
        });
    }
    const ocorrenciaAtualizada = {
        id: id,
        local: req.body.local,
        tipo_residuo: req.body.tipo_residuo,
        nivel_risco: req.body.nivel_risco,
        data_registro: req.body.data_registro,
        status: req.body.status
    };
    ocorrencias[indice] = ocorrenciaAtualizada;
    salvarDados(ocorrencias);
    res.status(200).json({
        mensagem: "Ocorrência atualizada com sucesso.",
        ocorrencia: ocorrenciaAtualizada
    });
});
app.delete("/ocorrencias/:id", (req, res) => {
    const ocorrencias = lerDados();
    const id = Number(req.params.id);
    const indice = ocorrencias.findIndex(
        item => item.id === id
    );
    if (indice === -1) {
        return res.status(404).json({
            mensagem: "Ocorrência não encontrada."
        });
    }
    const ocorrenciaExcluida = ocorrencias.splice(indice, 1)[0];
    salvarDados(ocorrencias);
    res.status(200).json({
        mensagem: "Ocorrência excluída com sucesso.",
        ocorrencia: ocorrenciaExcluida
    });
});
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`);
});