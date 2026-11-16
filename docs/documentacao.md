# Documentação de Análise e Projeto — Sistema de Biblioteca

## 1. Introdução e Escopo
O presente documento detalha a especificação, modelagem de requisitos e arquitetura de classes do **Sistema de Biblioteca**, aplicação web desenvolvida para automatizar o controle de acervo, o cadastro de leitores, a autenticação administrativa e o fluxo de empréstimos e devoluções com cálculo automático de multas por atraso.

---

## 2. Engenharia de Requisitos

### 2.1. Visão de Requisitos de Usuário e de Sistema
* **Requisito de Usuário:** O sistema deve permitir que leitores e bibliotecários pesquisem livros disponíveis no acervo de forma rápida e que o bibliotecário controle cadastros, empréstimos e devoluções.
* **Requisito de Sistema:** O sistema deve filtrar a base de dados de livros pelos atributos `titulo`, `autor` ou `categoria` em até 2 segundos, persistir os registros no armazenamento local e calcular multas automaticamente quando a data de devolução ultrapassar o prazo previsto.

### 2.2. Requisitos Funcionais (RF)
* **RF01 — Consultar Acervo:** Permitir a pesquisa em tempo real de livros por título, autor ou categoria, exibindo ISBN, estoque disponível e status.
* **RF02 — Autenticar no Sistema:** Exigir matrícula e senha do Bibliotecário para liberar o painel administrativo (cadastros, empréstimos e devoluções).
* **RF03 — Cadastrar Livro:** Permitir ao Bibliotecário registrar novos livros (ISBN, título, autor, categoria e quantidade de exemplares) e excluir títulos sem empréstimos ativos.
* **RF04 — Cadastrar Leitor:** Permitir ao Bibliotecário registrar novos leitores com nome completo, CPF (validado em 11 dígitos) e e-mail.
* **RF05 — Realizar Empréstimo:** Permitir vincular um livro disponível a um leitor cadastrado, registrando data de retirada e data prevista de devolução.
* **RF06 — Verificar Disponibilidade:** Validar automaticamente se `exemplarDisponivel > 0` antes de concluir um empréstimo.
* **RF07 — Registrar Devolução:** Permitir registrar o retorno do exemplar emprestado, alterando o status para concluído e incrementando o estoque.
* **RF08 — Emitir Alerta de Multa:** Calcular e exibir alerta de multa (R$ 2,50 por dia de atraso) caso a data de devolução ultrapasse a data prevista.

### 2.3. Requisitos Não Funcionais (RNF)
* **RNF01 (De Produto — Desempenho):** As buscas e filtros no catálogo devem responder instantaneamente (abaixo de 2 segundos).
* **RNF02 (De Produto — Usabilidade):** Interface web responsiva organizada em abas funcionais para navegação fluida em desktop e mobile.
* **RNF03 (Externos — Legais/LGPD):** Restrição de acesso aos dados cadastrais de leitores mediante autenticação do bibliotecário.
* **RNF04 (Organizacionais — Versionamento):** Versionamento do código-fonte e da documentação no Git utilizando o padrão *Conventional Commits*.

---

## 3. Modelagem de Casos de Uso

### 3.1. Diagrama de Casos de Uso
O diagrama de Casos de Uso contendo a fronteira do sistema, os atores `Leitor` e `Bibliotecário`, além das relações `<<include>>` e `<<extend>>`, está salvo em `./diagramas/casos-de-uso.jpg`.

### 3.2. Especificação Textual de Casos de Uso

#### Caso de Uso 01: Realizar Empréstimo
| Campo | Conteúdo |
| :--- | :--- |
| **Nome** | Realizar Empréstimo |
| **Ator(es)** | Bibliotecário |
| **Descrição** | O bibliotecário registra a retirada de um exemplar do acervo para um leitor cadastrado. |
| **Pré-condições** | Bibliotecário autenticado no painel administrativo e leitor previamente cadastrado. |
| **Fluxo Principal** | 1. O bibliotecário seleciona o leitor cadastrado pelo CPF.<br>2. O bibliotecário seleciona o livro desejado.<br>3. O sistema executa `<<include>>` Verificar Disponibilidade.<br>4. O bibliotecário define a data prevista de devolução.<br>5. O sistema registra o empréstimo, reduz o estoque disponível e atualiza a listagem. |
| **Fluxos Alternativos** | 1a. O bibliotecário pode cadastrar um novo leitor na aba de Leitores caso ele ainda não possua registro. |
| **Exceções** | 3a. Caso o livro possua 0 exemplares disponíveis, o sistema bloqueia o empréstimo e exibe alerta. |
| **Pós-condições** | O empréstimo passa a constar como "Ativo" e a quantidade disponível do livro é decrementada em 1 unidade. |

#### Caso de Uso 02: Registrar Devolução
| Campo | Conteúdo |
| :--- | :--- |
| **Nome** | Registrar Devolução |
| **Ator(es)** | Bibliotecário |
| **Descrição** | O bibliotecário registra o retorno de um livro emprestado ao acervo. |
| **Pré-condições** | Existir um empréstimo com status "Ativo". |
| **Fluxo Principal** | 1. O bibliotecário localiza o empréstimo na tabela de movimentações ativas.<br>2. O bibliotecário aciona a opção de devolução informando a data efetiva.<br>3. O sistema altera o status para "Devolvido" e incrementa o estoque do livro. |
| **Fluxos Alternativos** | — |
| **Exceções** | 2a. Se a data efetiva for posterior à data prevista, o sistema executa `<<extend>>` Emitir Alerta de Multa calculando R$ 2,50 por dia de atraso. |
| **Pós-condições** | O exemplar retorna ao estoque disponível no catálogo. |

---

## 4. Modelagem Estrutural (Diagrama de Classes)

### 4.1. Diagrama de Classes de Projeto
O diagrama de Classes de Projeto está salvo em `./diagramas/diagrama-classes.jpg`.

### 4.2. Dicionário de Classes
* **Bibliotecario:** Controla o acesso administrativo (`-matricula: String`, `-senha: String`, `+autenticar(): boolean`).
* **Leitor:** Armazena os dados dos usuários cadastrados (`-cpf: String`, `-nome: String`, `-email: String`, `+validarCPF(): boolean`, `+consultarHistorico(): List`).
* **Emprestimo:** Gerencia as retiradas, prazos, devoluções e cálculo de multa (`-idEmprestimo: int`, `-dataEmprestimo: Date`, `-dataDevolucaoPrevista: Date`, `-dataDevolucaoReal: Date`, `-status: String`, `+calcularMulta(): double`, `+registrarDevolucao(): void`).
* **Livro:** Gerencia os títulos e o saldo de exemplares (`-isbn: String`, `-titulo: String`, `-autor: String`, `-categoria: String`, `-exemplarDisponivel: int`, `+verificarDisponibilidade(): boolean`, `+atualizarEstoque(): void`).