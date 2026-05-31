# GuardDrive™ Advanced Landing Page Documentation

## 📄 Descrição Geral
Este repositório (`guarddrive-advanced-landing`) contém a versão avançada da landing page de validação de leads e visualização de insights de mercado do ecossistema GuardDrive™. 

Ela foi desenhada para ir muito além de concessionárias e seguradoras, integrando uma visualização limpa e premium de toda a infraestrutura técnica soberana do projeto.

## 🔐 Matriz de Acesso & NDA
Os dados comerciais sensíveis e diretrizes técnicas extraídos dos relatórios de pesquisa comercial de Adriano e dos documentos de Governança Operacional da Symbeon são protegidos por um **NDA Modal Protocol**. 

Antes que o formulário de requisição ou insights específicos sejam expostos, o usuário deve assinar digitalmente o NDA aceitando os termos de conformidade e propriedade intelectual da marca.

As regras de acesso são definidas no arquivo `access_matrix.json` e aplicadas no endpoint `/api/insights`.

## 🛰️ Telemetria Forense
Qualquer evento importante ocorrido na página (carregamento, abertura de modal de NDA, assinatura de NDA, submissão de leads) é enviado para o endpoint `/api/telemetry/event` e registrado em dois locais:
1. No banco de dados SQLite local (`advanced_leads.db`).
2. No arquivo de log contínuo (`logs/advanced_page_views.log`) em formato JSON-L.

Isso garante que toda a jornada do usuário possa ser auditada e correlacionada on-chain futuramente se necessário.
