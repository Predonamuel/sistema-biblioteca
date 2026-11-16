# Documentação de Análise e Projeto — Sistema de Biblioteca

## 1. Introdução e Escopo
O presente documento detalha a especificação, modelagem de requisitos e arquitetura de classes do **Sistema de Biblioteca**, desenvolvido para automatizar o controle de acervo, o gerenciamento de leitores e o fluxo de empréstimos e devoluções, garantindo a integridade dos dados e a conformidade legal.

---

## 2. Engenharia de Requisitos

### 2.1. Visão de Requisitos de Usuário e de Sistema
* **Requisito de Usuário:** O sistema deve permitir que os leitores consultem a disponibilidade de livros no acervo de forma rápida e intuitiva.
* **Requisito de Sistema:** O sistema deve consultar a base de dados filtrando pelos atributos de título, autor ou categoria e retornar a listagem com a quantidade de exemplares disponíveis em até 2 segundos.

### 2.2. Requisitos Funcionais (RF)
* **RF01 — Consultar Acervo:** O sistema deve permitir a busca de livros por título, autor ou categoria, exibindo a disponibilidade de exemplares.
* **RF02 — Autenticar no Sistema:** O sistema deve exigir matrícula e senha para liberar o acesso às funções administrativas do bibliotecário.
* **RF03 — Cadastrar Livro:** O sistema deve permitir o cadastro, edição e exclusão lógica de livros (ISBN, título, autor, categoria e quantidade disponível).
* **RF04 — Cadastrar Leitor:** O sistema deve permitir o registro de novos leitores contendo nome, CPF e e-mail.
* **RF05 — Realizar Empréstimo:** O sistema deve permitir vincular um ou mais livros disponíveis a um leitor cadastrado, registrando a data de retirada e a data prevista de devolução.
* **RF06 — Verificar Disponibilidade:** O sistema deve validar automaticamente se há exemplares em estoque (`qtdDisponivel > 0`) antes de confirmar um empréstimo.
* **RF07 — Registrar Devolução:** O sistema deve permitir registrar o retorno do livro emprestado, atualizando o status e incrementando o estoque.
* **RF08 — Emitir Alerta de Multa:** O sistema deve calcular dias de atraso e exibir o valor da multa caso a devolução ocorra após o prazo estipulado.

### 2.3. Requisitos Não Funcionais (RNF)
* **RNF01 (De Produto — Desempenho):** As consultas ao catálogo de livros devem responder em no máximo 2 segundos.
* **RNF02 (De Produto — Usabilidade):** A interface web deve ser responsiva e adaptada para navegação em computadores e dispositivos móveis.
* **RNF03 (Externos — Legais/LGPD):** O armazenamento de dados pessoais de leitores (como CPF e e-mail) deve seguir estritamente as normas de privacidade e proteção de dados.
* **RNF04 (Organizacionais — Versionamento):** O código-fonte e a documentação devem ser integralmente versionados no Git utilizando o padrão de *Conventional Commits*.

---

## 3. Modelagem de Casos de Uso

### 3.1. Diagrama de Casos de Uso
*(O diagrama estruturado de Casos de Uso com a fronteira do sistema, atores Leitor e Bibliotecário, inclusões e extensões encontra-se salvo no arquivo de imagem na pasta `./diagramas/casos-de-uso.jpg`)*

### 3.2. Especificação Textual de Casos de Uso

#### Caso de Uso 01: Realizar Empréstimo
| Campo | Conteúdo |
| :--- | :--- |
| **Nome** | Realizar Empréstimo |
| **Ator(es)** | Bibliotecário |
| **Descrição** | O bibliotecário registra a retirada de um ou mais livros do acervo para um leitor cadastrado. |
| **Pré-condições** | O bibliotecário deve estar autenticado e o leitor previamente cadastrado no sistema. |
| **Fluxo Principal** | 1. O bibliotecário informa o CPF do leitor.<br>2. O sistema exibe os dados cadastrais do leitor.<br>3. O bibliotecário seleciona os livros desejados.<br>4. O sistema executa a regra de verificação de disponibilidade.<br>5. O sistema registra a data de retirada, calcula a data de devolução, baixa o estoque e conclui o empréstimo. |
| **Fluxos Alternativos** | 3a. O bibliotecário pode adicionar mais de um título ao mesmo registro de empréstimo. |
| **Exceções** | 1a. Se o CPF não for localizado, o sistema emite um alerta impedindo a continuidade.<br>4a. Se o livro estiver sem exemplares disponíveis, o sistema bloqueia a seleção. |
| **Pós-condições** | O empréstimo fica ativo e a quantidade disponível do livro é decrementada. |

#### Caso de Uso 02: Registrar Devolução
| Campo | Conteúdo |
| :--- | :--- |
| **Nome** | Registrar Devolução |
| **Ator(es)** | Bibliotecário |
| **Descrição** | O bibliotecário registra a devolução de livros emprestados. |
| **Pré-condições** | Existir um empréstimo com status ativo vinculado ao leitor. |
| **Fluxo Principal** | 1. O bibliotecário localiza o empréstimo ativo pelo CPF ou ID.<br>2. O bibliotecário confirma a operação de devolução.<br>3. O sistema registra a data real de devolução e incrementa o estoque do livro. |
| **Fluxos Alternativos** | — |
| **Exceções** | 2a. Caso a data real ultrapasse a data prevista, o sistema aciona o cálculo e emissão de alerta de multa por atraso. |
| **Pós-condições** | O empréstimo é encerrado e o livro retorna formalmente ao acervo disponível. |

---

## 4. Modelagem Estrutural (Diagrama de Classes)

### 4.1. Diagrama de Classes de Projeto
*(O diagrama estruturado contendo as classes, atributos com visibilidade e tipos, métodos, associações e composição está salvo no arquivo `./diagramas/diagrama-classes.jpg`)*

### 4.2. Dicionário de Classes
* **Bibliotecario:** Representa o operador administrativo com permissões de controle. Atributos: `-matricula: String`, `-senha: String`. Método: `+autenticar(): boolean`.
* **Leitor:** Representa o cliente da biblioteca. Atributos: `-cpf: String`, `-nome: String`, `-email: String`. Métodos: `+validarCPF(): boolean`, `+consultarHistorico(): List`.
* **Emprestimo:** Controla o ciclo de movimentação dos exemplares. Atributos: `-idEmprestimo: int`, `-dataEmprestimo: Date`, `-dataDevolucaoPrevista: Date`, `-dataDevolucaoReal: Date`, `-status: String`. Métodos: `+calcularMulta(): double`, `+registrarDevolucao(): void`.
* **Livro:** Representa o item do acervo físico. Atributos: `-isbn: String`, `-titulo: String`, `-autor: String`, `-exemplarDisponivel: int`. Métodos: `+verificarDisponibilidade(): boolean`, `+atualizarEstoque(): void`.