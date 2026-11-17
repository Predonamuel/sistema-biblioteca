# Documentação de Análise e Projeto — Sistema de Biblioteca

## 1. Introdução e Escopo
O presente documento detalha a especificação, modelagem de requisitos e arquitetura de classes do **Sistema de Biblioteca**, aplicação web desenvolvida para automatizar o controle de acervo, o cadastro e histórico de leitores, a autenticação administrativa e o fluxo completo de empréstimos, renovações e devoluções com cálculo automático de multas por atraso.

---

## 2. Engenharia de Requisitos

### 2.1. Visão de Requisitos de Usuário e de Sistema
* **Requisito de Usuário:** O sistema deve permitir que leitores e bibliotecários pesquisem livros no acervo, e que o bibliotecário gerencie cadastros, histórico de empréstimos, renovações e devoluções de forma centralizada.
* **Requisito de Sistema:** O sistema deve filtrar a base de dados de livros por título, autor, categoria ou ISBN em até 2 segundos, persistir os dados localmente no navegador, calcular multas de atraso e permitir a extensão de prazos por meio de renovações.

### 2.2. Requisitos Funcionais (RF)
* **RF01 — Consultar Acervo:** Permitir a pesquisa em tempo real de livros por título, autor, categoria ou ISBN, exibindo estoque disponível e status.
* **RF02 — Autenticar no Sistema:** Exigir matrícula e senha do Bibliotecário para liberar o painel administrativo e restrições de escrita/exclusão.
* **RF03 — Cadastrar Livro:** Permitir ao Bibliotecário registrar novos livros ou incrementar estoque de títulos existentes, além de excluir livros sem empréstimos ativos.
* **RF04 — Cadastrar Leitor:** Permitir ao Bibliotecário registrar novos leitores com nome completo, CPF validado (11 dígitos) e e-mail.
* **RF05 — Gerenciar Leitores:** Permitir a exclusão segura de leitores sem empréstimos ativos e a consulta ao histórico individual de movimentações.
* **RF06 — Realizar Empréstimo:** Permitir vincular um livro disponível a um leitor cadastrado, registrando a data de retirada e a data prevista de devolução.
* **RF07 — Verificar Disponibilidade:** Validar automaticamente se há exemplares em estoque antes de concluir um empréstimo.
* **RF08 — Renovar Empréstimo:** Permitir ao Bibliotecário estender o prazo de devolução de um empréstimo ativo por mais 7 dias.
* **RF09 — Registrar Devolução:** Permitir registrar o retorno do exemplar emprestado, alterando o status para concluído e incrementando o estoque.
* **RF10 — Emitir Alerta de Multa:** Calcular e exibir alerta financeiro caso a data de devolução ultrapasse o prazo previsto.

### 2.3. Requisitos Não Funcionais (RNF)
* **RNF01 (De Produto — Desempenho):** As buscas e filtros no catálogo devem responder instantaneamente (abaixo de 2 segundos).
* **RNF02 (De Produto — Usabilidade):** Interface web responsiva organizada em painéis estatísticos e abas funcionais.
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
| **Fluxo Principal** | 1. O bibliotecário seleciona o leitor cadastrado pelo CPF.<br>2. O bibliotecário seleciona o livro desejado.<br>3. O sistema executa a verificação de disponibilidade.<br>4. O bibliotecário define a data prevista de devolução.<br>5. O sistema registra o empréstimo, reduz o estoque disponível e atualiza a listagem. |
| **Fluxos Alternativos** | 1a. O bibliotecário pode cadastrar um novo leitor na aba de Gerenciamento de Leitores caso ele ainda não possua registro. |
| **Exceções** | 3a. Caso o livro possua 0 exemplares disponíveis, o sistema bloqueia o empréstimo e exibe alerta. |
| **Pós-condições** | O empréstimo passa a constar como "Ativo" e a quantidade disponível do livro é decrementada em 1 unidade. |

#### Caso de Uso 02: Renovar Empréstimo
| Campo | Conteúdo |
| :--- | :--- |
| **Nome** | Renovar Empréstimo |
| **Ator(es)** | Bibliotecário |
| **Descrição** | O bibliotecário estende o prazo de um empréstimo ativo por mais 7 dias. |
| **Pré-condições** | Existir um empréstimo com status "Ativo". |
| **Fluxo Principal** | 1. O bibliotecário localiza o empréstimo ativo na tabela de controle.<br>2. O bibliotecário aciona a opção de renovação.<br>3. O sistema adiciona 7 dias à data prevista de devolução atual e atualiza o registro. |
| **Fluxos Alternativos** | — |
| **Exceções** | — |
| **Pós-condições** | A data prevista de devolução é estendida com sucesso. |

#### Caso de Uso 03: Registrar Devolução
| Campo | Conteúdo |
| :--- | :--- |
| **Nome** | Registrar Devolução |
| **Ator(es)** | Bibliotecário |
| **Descrição** | O bibliotecário registra o retorno de um livro emprestado ao acervo. |
| **Pré-condições** | Existir um empréstimo com status "Ativo". |
| **Fluxo Principal** | 1. O bibliotecário localiza o empréstimo na tabela de movimentações ativas.<br>2. O bibliotecário aciona a opção de devolução.<br>3. O sistema registra a data real de devolução, calcula eventuais multas por atraso e incrementa o estoque do livro. |
| **Fluxos Alternativos** | — |
| **Exceções** | 2a. Se a data real for posterior à data prevista, o sistema aciona o cálculo e emissão de alerta de multa por atraso. |
| **Pós-condições** | O empréstimo é encerrado e o exemplar retorna ao estoque disponível no catálogo. |

---

## 4. Modelagem Estrutural (Diagrama de Classes)

### 4.1. Diagrama de Classes de Projeto
O diagrama de Classes de Projeto está salvo em `./diagramas/diagrama-classes.jpg`.

### 4.2. Dicionário de Classes
* **Bibliotecario:** Controla o acesso administrativo e gerencia as operações (`-matricula: String`, `-senha: String`, `+autenticar(): boolean`).
* **Leitor:** Armazena os dados cadastrais e permite rastreio de histórico (`-cpf: String`, `-nome: String`, `-email: String`, `+validarCPF(): boolean`, `+consultarHistorico(): List`).
* **Emprestimo:** Gerencia as retiradas, prazos, renovações, devoluções e cálculo de multas (`-idEmprestimo: int`, `-dataEmprestimo: Date`, `-dataDevolucaoPrevista: Date`, `-dataDevolucaoReal: Date`, `-status: String`, `+calcularMulta(): double`, `+renovarPrazo(): void`, `+registrarDevolucao(): void`).
* **Livro:** Gerencia os títulos, categorias e o saldo de exemplares (`-isbn: String`, `-titulo: String`, `-autor: String`, `-categoria: String`, `-exemplarDisponivel: int`, `+verificarDisponibilidade(): boolean`, `+atualizarEstoque(): void`).