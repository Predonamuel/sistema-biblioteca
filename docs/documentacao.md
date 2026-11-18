# Documentação de Análise e Projeto — Sistema de Biblioteca

## 1. Introdução e Escopo
O presente documento especifica a arquitetura, as regras de negócio, a engenharia de requisitos e a modelagem estrutural e comportamental do **Sistema de Biblioteca (Biblioteca Central)**. A aplicação foi projetada para automatizar a consulta pública do acervo bibliográfico, a autenticação restrita do corpo administrativo, o controle cadastral de leitores e exemplares, e o ciclo operacional completo de empréstimos, renovações e devoluções com cálculo automático de encargos por atraso.

---

## 2. Regras de Negócio (RN)

* **RN01 — Unicidade Cadastral por CPF:** Cada leitor é identificado univocamente pelo seu Cadastro de Pessoa Física (CPF), composto rigorosamente por 11 dígitos numéricos, bloqueando duplicidades na base.
* **RN02 — Consolidação de Estoque por ISBN:** Ao cadastrar um livro cujo código ISBN já exista no acervo, o sistema incrementa a quantidade disponível no título existente em vez de duplicar o registro.
* **RN03 — Bloqueio de Empréstimo sem Saldo:** Nenhum empréstimo pode ser efetivado caso o atributo `qtdDisponivel` do livro selecionado seja igual ou inferior a zero.
* **RN04 — Prazo Padrão e Renovação:** O prazo padrão sugerido para devolução é de 7 dias corridos a partir da retirada. Empréstimos com status `Ativo` podem ser renovados por mais 7 dias antes do encerramento.
* **RN05 — Cálculo de Multa por Atraso:** Caso a devolução real ocorra após a data prevista, o sistema aplica multa automática de **R$ 2,50 por dia de atraso**.
* **RN06 — Integridade Referencial na Exclusão:** O sistema impede a exclusão de qualquer livro ou leitor que possua movimentações com status `Ativo`.

---

## 3. Engenharia de Requisitos

### 3.1. Requisitos Funcionais (RF)
* **RF01 — Consultar Acervo:** Permitir a pesquisa em tempo real de livros por título, autor, categoria ou ISBN, com filtro adicional por disponibilidade.
* **RF02 — Autenticar no Sistema:** Validar matrícula e senha do Bibliotecário para liberar as interfaces administrativas de escrita e exclusão.
* **RF03 — Cadastrar Livro:** Permitir ao Bibliotecário registrar novos livros ou adicionar exemplares a um ISBN já existente, além de excluir obras sem empréstimos ativos.
* **RF04 — Cadastrar Leitor:** Permitir ao Bibliotecário registrar novos leitores com nome completo, CPF validado e e-mail institucional.
* **RF05 — Gerenciar Leitores e Histórico:** Permitir a exclusão segura de leitores sem pendências e a visualização do histórico individual de empréstimos.
* **RF06 — Realizar Empréstimo:** Vincular um livro disponível a um leitor cadastrado, registrando a data de retirada e o prazo previsto de devolução.
* **RF07 — Verificar Disponibilidade:** Validar automaticamente se há exemplares disponíveis em estoque antes de confirmar o empréstimo.
* **RF08 — Renovar Empréstimo:** Estender em 7 dias o prazo previsto de devolução de um empréstimo ativo.
* **RF09 — Registrar Devolução:** Registrar o retorno do exemplar, alterar o status para `Devolvido` e incrementar o estoque disponível.
* **RF10 — Emitir Alerta de Multa:** Calcular o encargo financeiro em caso de atraso e exibir alerta imediato na devolução.

### 3.2. Requisitos Não Funcionais (RNF)
* **RNF01 (Desempenho):** Filtragem e renderização instantânea do catálogo (tempo de resposta inferior a 2 segundos).
* **RNF02 (Persistência):** Armazenamento local contínuo via `localStorage` e controle de sessão administrativa via `sessionStorage`.
* **RNF03 (Segurança e LGPD):** Ocultação e bloqueio das rotas e dados pessoais de leitores para usuários não autenticados.
* **RNF04 (Manutenibilidade):** Arquitetura desacoplada entre estrutura (`index.html`), apresentação (`style.css`) e lógica (`script.js`), versionada com *Conventional Commits*.

### 3.3. Matriz de Rastreabilidade
| Requisito | Caso de Uso / Classe | Função no Código (`script.js`) |
| :--- | :--- | :--- |
| RF01 | Consultar Acervo / `Livro` | `renderizarAcervo()` |
| RF02 | Autenticar no Sistema / `Bibliotecario` | `atualizarInterfaceAuth()` |
| RF03 | Cadastrar Livro / `Livro` | `formLivro` (`submit`), `excluirLivro()` |
| RF04 / RF05 | Cadastro Leitor / `Leitor` | `formLeitor` (`submit`), `validarCPF()`, `abrirHistoricoLeitor()` |
| RF06 / RF07 | Realizar Empréstimo / `Emprestimo` | `formEmprestimo` (`submit`) |
| RF08 | Renovar Empréstimo / `Emprestimo` | `renovarEmprestimo()` |
| RF09 / RF10 | Registrar Devolução / `Emprestimo` | `registrarDevolucao()`, `calcularMulta()` |

---

## 4. Modelagem Comportamental (Casos de Uso)

### 4.1. Diagrama de Casos de Uso
![Diagrama de Casos de Uso](./diagramas/casos%20de%20uso.jpeg)

### 4.2. Especificação Textual de Casos de Uso

#### Caso de Uso 01: Realizar Empréstimo
| Campo | Descrição |
| :--- | :--- |
| **Nome** | Realizar Empréstimo |
| **Ator Principal** | Bibliotecário |
| **Pré-condições** | Bibliotecário autenticado no sistema e leitor previamente cadastrado. |
| **Fluxo Principal** | 1. O bibliotecário seleciona o leitor cadastrado.<br>2. O bibliotecário seleciona a obra desejada.<br>3. O sistema executa a inclusão `<<include>>` **Verificar Disponibilidade**.<br>4. O bibliotecário confirma a data limite de devolução.<br>5. O sistema efetiva o empréstimo com status `Ativo` e reduz `qtdDisponivel` em 1 unidade. |
| **Fluxo Alternativo** | 1a. Caso o leitor não possua cadastro, o bibliotecário realiza o registro na aba de Base de Leitores antes de prosseguir. |
| **Fluxo de Exceção** | 3a. Caso `qtdDisponivel` seja igual a 0, o sistema bloqueia a seleção e impede o registro. |
| **Pós-condições** | O empréstimo passa a constar na tabela de movimentações ativas e o saldo do acervo é atualizado. |

#### Caso de Uso 02: Registrar Devolução
| Campo | Descrição |
| :--- | :--- |
| **Nome** | Registrar Devolução |
| **Ator Principal** | Bibliotecário |
| **Pré-condições** | Existir um empréstimo com status `Ativo`. |
| **Fluxo Principal** | 1. O bibliotecário localiza o empréstimo ativo na tabela de movimentações.<br>2. O bibliotecário aciona a operação de devolução.<br>3. O sistema registra `dataDevolucaoReal`, altera o status para `Devolvido` e incrementa `qtdDisponivel` em 1 unidade. |
| **Fluxo Alternativo** | 2a. Antes da devolução, o bibliotecário pode acionar a renovação para estender o prazo em 7 dias. |
| **Fluxo de Exceção** | 3a. Se `dataDevolucaoReal` for posterior a `dataPrevistaDevolucao`, o sistema aciona a extensão `<<extend>>` **Emitir Alerta de Multa**, calculando R$ 2,50 por dia de atraso. |
| **Pós-condições** | O exemplar retorna ao saldo disponível do acervo e o registro fica encerrado. |

---

## 5. Modelagem Estrutural (Diagrama de Classes)

### 5.1. Diagrama de Classes de Projeto
![Diagrama de Classes de Projeto](./diagramas/classes%20de%20projeto.jpeg)

### 5.2. Dicionário de Classes e Relacionamentos
* **Bibliotecario:** Representa o operador administrativo (`-ID: int`, `-Nome: String`, `-Matricula: String`, `-Senha: String`, `+autenticar(Matricula: String, Senha: String): boolean`). Relaciona-se com `Emprestimo` na cardinalidade `1` para `0..*` (*Registra*).
* **Leitor:** Representa o usuário habilitado a retirar obras (`-ID: int`, `-Nome: String`, `-CPF: String`, `-Email: String`, `+validarCPF(): boolean`, `+consultarHistorico(): List`). Relaciona-se com `Livro` na cardinalidade `1` para `1..*` (*Realiza*).
* **Emprestimo:** Controla o ciclo de vida da movimentação (`-ID: int`, `-dataRetirada: Date`, `-dataPrevistaDevolucao: Date`, `-dataDevolucaoReal: Date`, `-Status: String`, `+calcularMulta(): double`, `+finalizarDevolucao(): void`). Possui agregação com `Livro` (`1` para `1..*`).
* **Livro:** Representa as obras catalogadas no acervo (`-isbn: String`, `-Titulo: String`, `-Autor: String`, `-Categoria: String`, `-qtdDisponivel: int`, `+verificarDisponibilidade(): boolean`, `+atualizarEstoque(qtd: int): void`).