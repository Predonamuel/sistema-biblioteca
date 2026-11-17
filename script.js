const dadosIniciaisLivros = [
    { isbn: "978-8535236996", titulo: "Engenharia de Software", autor: "Ian Sommerville", categoria: "Tecnologia", exemplarDisponivel: 4 },
    { isbn: "978-8575225639", titulo: "Entendendo Algoritmos", autor: "Aditya Bhargava", categoria: "Tecnologia", exemplarDisponivel: 2 },
    { isbn: "978-8535914849", titulo: "1984", autor: "George Orwell", categoria: "Ficção", exemplarDisponivel: 1 },
    { isbn: "978-8579307645", titulo: "Análise e Projeto de Sistemas", autor: "William S. Davis", categoria: "Tecnologia", exemplarDisponivel: 0 }
];

const dadosIniciaisLeitores = [
    { cpf: "12345678901", nome: "Ana Paula Silva", email: "ana.silva@email.com" },
    { cpf: "98765432100", nome: "Carlos Eduardo Souza", email: "carlos.souza@email.com" }
];

let acervo = JSON.parse(localStorage.getItem("bib_acervo")) || dadosIniciaisLivros;
let leitores = JSON.parse(localStorage.getItem("bib_leitores")) || dadosIniciaisLeitores;
let emprestimos = JSON.parse(localStorage.getItem("bib_emprestimos")) || [];
let isAdmin = sessionStorage.getItem("bib_admin") === "true";

function salvarDados() {
    localStorage.setItem("bib_acervo", JSON.stringify(acervo));
    localStorage.setItem("bib_leitores", JSON.stringify(leitores));
    localStorage.setItem("bib_emprestimos", JSON.stringify(emprestimos));
}

function obterDataHoje() {
    return new Date().toISOString().split("T")[0];
}

function obterDataFutura(dias) {
    const data = new Date();
    data.setDate(data.getDate() + dias);
    return data.toISOString().split("T")[0];
}

function atualizarEstatisticas() {
    document.getElementById("statTotalLivros").textContent = acervo.length;
    const totalDisponiveis = acervo.reduce((acc, item) => acc + item.exemplarDisponivel, 0);
    document.getElementById("statDisponiveis").textContent = totalDisponiveis;
    document.getElementById("statTotalLeitores").textContent = leitores.length;
    const ativos = emprestimos.filter(e => e.status === "Ativo").length;
    document.getElementById("statEmprestimosAtivos").textContent = ativos;
}

function atualizarInterfaceAuth() {
    const elementosAdmin = document.querySelectorAll(".admin-only");
    const statusBadge = document.getElementById("statusAdmin");
    const btnLogin = document.getElementById("btnAbrirLogin");
    const btnLogout = document.getElementById("btnLogout");

    if (isAdmin) {
        elementosAdmin.forEach(el => el.classList.remove("hidden"));
        statusBadge.textContent = "Bibliotecário Autenticado";
        statusBadge.className = "badge badge-online";
        btnLogin.classList.add("hidden");
        btnLogout.classList.remove("hidden");
    } else {
        elementosAdmin.forEach(el => el.classList.add("hidden"));
        statusBadge.textContent = "Modo Leitor";
        statusBadge.className = "badge badge-offline";
        btnLogin.classList.remove("hidden");
        btnLogout.classList.add("hidden");
        ativarAba("tabAcervo");
    }
    renderizarAcervo();
}

function ativarAba(tabId) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.tab === tabId);
    });
    document.querySelectorAll(".tab-content").forEach(sec => {
        sec.classList.toggle("active", sec.id === tabId);
    });
}

document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => ativarAba(btn.dataset.tab));
});

const modalLogin = document.getElementById("modalLogin");
document.getElementById("btnAbrirLogin").addEventListener("click", () => {
    modalLogin.classList.remove("hidden");
});

document.getElementById("btnCancelarLogin").addEventListener("click", () => {
    modalLogin.classList.add("hidden");
    document.getElementById("msgLogin").textContent = "";
});

document.getElementById("btnConfirmarLogin").addEventListener("click", () => {
    const matricula = document.getElementById("loginMatricula").value.trim();
    const senha = document.getElementById("loginSenha").value.trim();
    const msgLogin = document.getElementById("msgLogin");

    if (matricula === "admin" && senha === "1234") {
        isAdmin = true;
        sessionStorage.setItem("bib_admin", "true");
        modalLogin.classList.add("hidden");
        document.getElementById("loginMatricula").value = "";
        document.getElementById("loginSenha").value = "";
        msgLogin.textContent = "";
        atualizarInterfaceAuth();
    } else {
        msgLogin.style.color = "#dc2626";
        msgLogin.textContent = "Matrícula ou senha inválidos.";
    }
});

document.getElementById("btnLogout").addEventListener("click", () => {
    isAdmin = false;
    sessionStorage.removeItem("bib_admin");
    atualizarInterfaceAuth();
});

function renderizarAcervo() {
    const termo = document.getElementById("buscaLivro").value.toLowerCase();
    const filtro = document.getElementById("filtroDisponibilidade").value;
    const tbody = document.getElementById("tabelaAcervo");

    const filtrados = acervo.filter(l => {
        const bateTexto = l.titulo.toLowerCase().includes(termo) ||
            l.autor.toLowerCase().includes(termo) ||
            l.categoria.toLowerCase().includes(termo) ||
            l.isbn.toLowerCase().includes(termo);
        const bateDisp = filtro === "todos" || l.exemplarDisponivel > 0;
        return bateTexto && bateDisp;
    });

    tbody.innerHTML = filtrados.map(l => `
        <tr>
            <td>${l.isbn}</td>
            <td><strong>${l.titulo}</strong></td>
            <td>${l.autor}</td>
            <td>${l.categoria}</td>
            <td>${l.exemplarDisponivel}</td>
            <td>
                <span class="badge ${l.exemplarDisponivel > 0 ? "badge-ok" : "badge-warn"}">
                    ${l.exemplarDisponivel > 0 ? "Disponível" : "Indisponível"}
                </span>
            </td>
            <td class="${isAdmin ? "" : "hidden"}">
                <button class="btn-danger" style="padding: 6px 10px; font-size: 0.8rem;" onclick="excluirLivro('${l.isbn}')">Excluir</button>
            </td>
        </tr>
    `).join("");

    atualizarSelectsEmprestimo();
    atualizarEstatisticas();
}

document.getElementById("buscaLivro").addEventListener("input", renderizarAcervo);
document.getElementById("filtroDisponibilidade").addEventListener("change", renderizarAcervo);

document.getElementById("formLivro").addEventListener("submit", (e) => {
    e.preventDefault();
    const isbn = document.getElementById("livroIsbn").value.trim();
    const titulo = document.getElementById("livroTitulo").value.trim();
    const autor = document.getElementById("livroAutor").value.trim();
    const categoria = document.getElementById("livroCategoria").value.trim();
    const qtd = parseInt(document.getElementById("livroQtd").value, 10);
    const msg = document.getElementById("msgLivro");

    const existente = acervo.find(l => l.isbn === isbn);
    if (existente) {
        existente.exemplarDisponivel += qtd;
        msg.style.color = "#16a34a";
        msg.textContent = "Estoque do ISBN existente atualizado com sucesso.";
    } else {
        acervo.push({ isbn, titulo, autor, categoria, exemplarDisponivel: qtd });
        msg.style.color = "#16a34a";
        msg.textContent = "Livro cadastrado no acervo com sucesso.";
    }

    salvarDados();
    e.target.reset();
    renderizarAcervo();
});

function excluirLivro(isbn) {
    const temAtivo = emprestimos.some(emp => emp.isbn === isbn && emp.status === "Ativo");
    if (temAtivo) {
        alert("Não é possível excluir um livro com empréstimos ativos.");
        return;
    }
    acervo = acervo.filter(l => l.isbn !== isbn);
    salvarDados();
    renderizarAcervo();
}

function validarCPF(cpf) {
    return /^\d{11}$/.test(cpf);
}

function renderizarLeitores() {
    const tbody = document.getElementById("tabelaLeitores");
    tbody.innerHTML = leitores.map(leitor => {
        const qtdAtivos = emprestimos.filter(e => e.cpfLeitor === leitor.cpf && e.status === "Ativo").length;
        return `
            <tr>
                <td>${leitor.cpf}</td>
                <td>${leitor.nome}</td>
                <td>${leitor.email}</td>
                <td>${qtdAtivos}</td>
                <td>
                    <button class="btn-secondary" style="padding: 6px 10px; font-size: 0.8rem;" onclick="abrirHistoricoLeitor('${leitor.cpf}')">Histórico</button>
                    <button class="btn-danger" style="padding: 6px 10px; font-size: 0.8rem;" onclick="excluirLeitor('${leitor.cpf}')">Excluir</button>
                </td>
            </tr>
        `;
    }).join("");

    atualizarSelectsEmprestimo();
    atualizarEstatisticas();
}

document.getElementById("formLeitor").addEventListener("submit", (e) => {
    e.preventDefault();
    const nome = document.getElementById("leitorNome").value.trim();
    const cpf = document.getElementById("leitorCpf").value.trim();
    const email = document.getElementById("leitorEmail").value.trim();
    const msg = document.getElementById("msgLeitor");

    if (!validarCPF(cpf)) {
        msg.style.color = "#dc2626";
        msg.textContent = "CPF inválido. Informe exatamente 11 dígitos numéricos.";
        return;
    }

    if (leitores.some(l => l.cpf === cpf)) {
        msg.style.color = "#dc2626";
        msg.textContent = "Já existe um leitor cadastrado com este CPF.";
        return;
    }

    leitores.push({ cpf, nome, email });
    salvarDados();
    e.target.reset();
    msg.style.color = "#16a34a";
    msg.textContent = "Leitor cadastrado com sucesso.";
    renderizarLeitores();
});

function excluirLeitor(cpf) {
    const temAtivo = emprestimos.some(emp => emp.cpfLeitor === cpf && emp.status === "Ativo");
    if (temAtivo) {
        alert("Não é possível excluir um leitor que possui empréstimos ativos.");
        return;
    }
    leitores = leitores.filter(l => l.cpf !== cpf);
    salvarDados();
    renderizarLeitores();
}

const modalHistorico = document.getElementById("modalHistorico");
document.getElementById("btnFecharHistorico").addEventListener("click", () => {
    modalHistorico.classList.add("hidden");
});

function abrirHistoricoLeitor(cpf) {
    const leitor = leitores.find(l => l.cpf === cpf);
    if (!leitor) return;

    const historicoDoLeitor = emprestimos.filter(e => e.cpfLeitor === cpf);
    const container = document.getElementById("conteudoHistoricoLeitor");

    let html = `<p><strong>Leitor:</strong> ${leitor.nome} (CPF: ${leitor.cpf})</p>`;
    if (historicoDoLeitor.length === 0) {
        html += `<p style="margin-top: 12px; color: #6b7280;">Nenhum empréstimo registrado para este leitor.</p>`;
    } else {
        html += `
            <div class="table-wrapper" style="margin-top: 12px;">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Livro</th>
                            <th>Retirada</th>
                            <th>Prevista</th>
                            <th>Status</th>
                            <th>Multa</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        historicoDoLeitor.forEach(emp => {
            const livro = acervo.find(l => l.isbn === emp.isbn);
            html += `
                <tr>
                    <td>#${emp.idEmprestimo}</td>
                    <td>${livro ? livro.titulo : emp.isbn}</td>
                    <td>${emp.dataEmprestimo}</td>
                    <td>${emp.dataDevolucaoPrevista}</td>
                    <td><span class="badge ${emp.status === "Ativo" ? "badge-warn" : "badge-ok"}">${emp.status}</span></td>
                    <td>R$ ${emp.multa.toFixed(2)}</td>
                </tr>
            `;
        });
        html += `</tbody></table></div>`;
    }

    container.innerHTML = html;
    modalHistorico.classList.remove("hidden");
}

function atualizarSelectsEmprestimo() {
    const selectLeitor = document.getElementById("selectLeitor");
    const selectLivro = document.getElementById("selectLivro");

    selectLeitor.innerHTML = '<option value="">Selecione o Leitor...</option>' +
        leitores.map(l => `<option value="${l.cpf}">${l.nome} (CPF: ${l.cpf})</option>`).join("");

    selectLivro.innerHTML = '<option value="">Selecione o Livro...</option>' +
        acervo.map(l => `<option value="${l.isbn}" ${l.exemplarDisponivel === 0 ? "disabled" : ""}>${l.titulo} (${l.exemplarDisponivel} disp.)</option>`).join("");
}

function calcularMulta(dataPrevista, dataReal) {
    const d1 = new Date(dataPrevista + "T00:00:00");
    const d2 = new Date(dataReal + "T00:00:00");
    const diffTempo = d2 - d1;
    const diasAtraso = Math.floor(diffTempo / (1000 * 60 * 60 * 24));
    return diasAtraso > 0 ? diasAtraso * 2.5 : 0;
}

function renderizarEmprestimos() {
    const tbody = document.getElementById("tabelaEmprestimos");
    tbody.innerHTML = emprestimos.map(emp => {
        const leitor = leitores.find(l => l.cpf === emp.cpfLeitor);
        const livro = acervo.find(l => l.isbn === emp.isbn);
        const nomeLeitor = leitor ? leitor.nome : emp.cpfLeitor;
        const tituloLivro = livro ? livro.titulo : emp.isbn;

        return `
            <tr>
                <td>#${emp.idEmprestimo}</td>
                <td>${nomeLeitor}</td>
                <td>${tituloLivro}</td>
                <td>${emp.dataEmprestimo}</td>
                <td>${emp.dataDevolucaoPrevista}</td>
                <td>
                    <span class="badge ${emp.status === "Ativo" ? "badge-warn" : "badge-ok"}">
                        ${emp.status}
                    </span>
                </td>
                <td>R$ ${emp.multa.toFixed(2)}</td>
                <td>
                    ${emp.status === "Ativo"
                        ? `
                            <button class="btn-success" onclick="registrarDevolucao(${emp.idEmprestimo})">Devolver</button>
                            <button class="btn-warning" onclick="renovarEmprestimo(${emp.idEmprestimo})">Renovar</button>
                          `
                        : `Devolvido em ${emp.dataDevolucaoReal}`
                    }
                </td>
            </tr>
        `;
    }).join("");

    renderizarLeitores();
    atualizarEstatisticas();
}

document.getElementById("formEmprestimo").addEventListener("submit", (e) => {
    e.preventDefault();
    const cpfLeitor = document.getElementById("selectLeitor").value;
    const isbn = document.getElementById("selectLivro").value;
    const dataDevolucaoPrevista = document.getElementById("dataPrevista").value;
    const msg = document.getElementById("msgEmprestimo");

    const livro = acervo.find(l => l.isbn === isbn);
    if (!livro || livro.exemplarDisponivel <= 0) {
        msg.style.color = "#dc2626";
        msg.textContent = "Livro indisponível para empréstimo.";
        return;
    }

    livro.exemplarDisponivel--;
    const novoEmprestimo = {
        idEmprestimo: emprestimos.length + 1,
        cpfLeitor,
        isbn,
        dataEmprestimo: obterDataHoje(),
        dataDevolucaoPrevista,
        dataDevolucaoReal: null,
        status: "Ativo",
        multa: 0
    };

    emprestimos.push(novoEmprestimo);
    salvarDados();
    msg.style.color = "#16a34a";
    msg.textContent = "Empréstimo registrado com sucesso.";
    renderizarAcervo();
    renderizarEmprestimos();
});

function renovarEmprestimo(idEmprestimo) {
    const emp = emprestimos.find(e => e.idEmprestimo === idEmprestimo);
    if (!emp || emp.status !== "Ativo") return;

    const dataAtualPrevista = new Date(emp.dataDevolucaoPrevista + "T00:00:00");
    dataAtualPrevista.setDate(dataAtualPrevista.getDate() + 7);
    emp.dataDevolucaoPrevista = dataAtualPrevista.toISOString().split("T")[0];

    salvarDados();
    renderizarEmprestimos();
    alert(`Empréstimo #${emp.idEmprestimo} renovado com sucesso por mais 7 dias! Nova data: ${emp.dataDevolucaoPrevista}`);
}

function registrarDevolucao(idEmprestimo) {
    const emp = emprestimos.find(e => e.idEmprestimo === idEmprestimo);
    if (!emp || emp.status !== "Ativo") return;

    const dataReal = document.getElementById("dataSimulacaoDevolucao").value || obterDataHoje();
    const valorMulta = calcularMulta(emp.dataDevolucaoPrevista, dataReal);

    emp.dataDevolucaoReal = dataReal;
    emp.status = "Devolvido";
    emp.multa = valorMulta;

    const livro = acervo.find(l => l.isbn === emp.isbn);
    if (livro) {
        livro.exemplarDisponivel++;
    }

    salvarDados();
    renderizarAcervo();
    renderizarEmprestimos();

    if (valorMulta > 0) {
        alert(`Atenção: Devolução com atraso! Multa calculada: R$ ${valorMulta.toFixed(2)}`);
    }
}

document.getElementById("dataPrevista").value = obterDataFutura(7);
document.getElementById("dataSimulacaoDevolucao").value = obterDataHoje();
atualizarInterfaceAuth();
renderizarLeitores();
renderizarEmprestimos();