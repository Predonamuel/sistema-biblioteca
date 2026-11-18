# Sistema de Gestão de Biblioteca (Biblioteca Central)

> Trabalho prático desenvolvido para a disciplina de **Análise e Projeto de Sistemas (APS)** da Universidade de Franca (Unifran). O projeto consiste em uma aplicação web modular voltada para o gerenciamento de acervos acadêmicos, controle de leitores com validação de CPF, registro de empréstimos, renovações e cálculo automatizado de multas.

---

## Destaques do Projeto

* **Identidade Visual Editorial:** Interface desenvolvida com foco em UI/UX moderna (modo escuro com tons quentes e tipografia refinada), fugindo do padrão visual genérico de sistemas acadêmicos comuns.
* **Arquitetura Desacoplada (*Client-Side*):** Estrutura limpa baseada em módulos independentes (`index.html`, `style.css` e `script.js`), sem dependência de servidores complexos na camada de apresentação.
* **Persistência Local:** Utilização de `localStorage` para salvamento contínuo dos dados e `sessionStorage` para controle de sessão restrita do operador.
* **Engenharia de Requisitos Completa:** Regras de negócio formalizadas (RN01 a RN06) cobrindo unicidade de CPF, agrupamento por ISBN, controle de estoque e multas por atraso.

---

## Tecnologias Utilizadas

* **Front-End:** HTML5 Semântico, CSS3 Moderno (Custom Properties, Flexbox e Grid).
* **Lógica e Dinâmica:** JavaScript Puro (Vanilla ES6+) com manipulação do DOM e eventos em tempo real.
* **Modelagem e Documentação:** UML (Diagramas de Casos de Uso e de Classes).
* **Versionamento:** Git & GitHub com histórico de commits semânticos.

---

## Regras de Negócio Implementadas

| ID | Regra Operacional | Descrição Técnica |
| :--- | :--- | :--- |
| **RN01** | Cadastro Único por CPF | Validação estrita de 11 dígitos numéricos e bloqueio de CPFs duplicados. |
| **RN02** | Agrupamento por ISBN | Incremento automático de exemplares em títulos já existentes no acervo. |
| **RN03** | Controle de Estoque | Bloqueio imediato de empréstimos para obras com saldo zerado. |
| **RN04** | Prazos e Renovação | Padrão inicial de 7 dias de empréstimo, prorrogáveis por mais 7 dias. |
| **RN05** | Multa por Atraso | Cálculo automatizado de **R$ 2,50** por dia útil de atraso na devolução. |
| **RN06** | Integridade Referencial | Impedimento de exclusão de livros ou leitores vinculados a empréstimos ativos. |

---

## Estrutura do Repositório

```text
sistema-biblioteca/
├── index.html              # Interface principal da aplicação
├── style.css               # Folha de estilos do Design System editorial
├── script.js               # Lógica de negócio, persistência e manipulação de dados
└── docs/
    ├── documentacao.md     # Relatório técnico completo de APS
    └── diagramas/
        ├── casos-de-uso.jpeg      # Diagrama UML de Casos de Uso
        └── classes-de-projeto.jpeg  # Diagrama UML de Classes 
```
---

## Documentação Técnica

A documentação detalhada contendo a especificação dos requisitos funcionais, não funcionais, matriz de rastreabilidade, descrições textuais de casos de uso e o dicionário de classes está disponível no diretório do projeto:
* **[Acessar a Documentação Completa (`docs/documentacao.md`)](docs/documentacao.md)**

---

## Acesso Online

A aplicação está hospedada e disponível para testes diretamente pelo navegador:
* **Acessar o Sistema:** https://sistema-biblioteca-unf.vercel.app

---

## Autor

* **Pedro Emanuel Cócio Prado** — *Universidade de Franca (Unifran)*

