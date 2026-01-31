<role>
    Você é um programador fullstack senior, e está encarregado de criar uma aplicação responsável por calcular os ganhos, gastos e margem de uma empresa de impressão 3d.
    A aplicação deve permitir o cadastro de cada venda, dentro dessa venda deve permitir inserir as informações necessárias para o devido cálculo.
</role>

<requirements>
    <negocio>
        -O usuário deve poder cadastrar uma plataforma de venda com nome, taxa de venda e porcentagem de comissão, que será utilizada no cadastro de vendas.
        -O usuário deve poder cadastrar uma nova venda.
        -Nessa nova venda, o usuário vai poder colocar as informações de ganho e custo da impressão:
            -Valor recebido
            -Custo da impressão
            -Custo de venda da plataforma
            -Custo para envio(valor da caixa, plastico bolha etc)
            -Plataforma de venda. Que será buscada do cadastro de plataforma de vendas
            -Por onde veio a venda(instagram, direto da shopee ou Mercado livre etc)
        -A venda pode ter as seguintes situações:
            -Em produção
            -Aguardando Envio
            -Enviada
            -Finalizada
        -Deverá com base nas informações enviadas, calcular o valor de lucro liquido da venda (Venda - porcentagem da plataforma - taxa fixa da plataforma  - gasto de filamento - gasto de envio).
        -Deve permitir editar uma venda.
        -Deve permitir excluir uma venda(confirmar antes de excluir)
        -Deve salvar a data atual como data de cadastro da venda.
        -A venda deve ser cadastrada com status de Em Produção
        -Deve ter uma tela inicial com a lista das vendas, com seus campos e ordenável.
        -A lista deve ter filtros pelos campos, range de datas.
        -Deve ter icones para os status.
    </negocio>
    <técnico>
        -Deve separar o front end do backend nas pastas criadas
        -Backend deve ser feito com node.js
        -Frontend deve ser feito com react.js e ser bem agradável, inclusive com animações, skeleton loading
        -Backend deve ser organizado e não deve colocar os endpoints no index
        -Deve deixar pronto para conectar uma base de dados postgresql para ser criada posteriormente
        -Deve criar o SQL de criação das tabelas de acordo com o que for criado no backend
        -Criar scripts SQL de CREATE TABLE com chaves estrangeiras, índices em campos de filtro .
        -Deve ter testes, inclusive com mock
        -Ter um serviço de domínio para cálculo de lucro/margem recebendo DTO limpo (sem dependência de Express).
        -Tests unitários em cima dessa lógica de cálculo, garantindo que qualquer alteração no modelo não quebre os números.
        -Feedback visual em ações CRUD (toasts em PT-BR, ex: “Venda criada com sucesso”).
        -Layout que funcione bem no celular (pensando em lançar dados rapidamente depois da venda).
    </técnico>

    <critico>
        ***DEVE*** respeitar regras de clean code
        ***DEVE*** ter toda sua interface em português
        ***DEVE*** deixar pronto um script sql para criação da base de dados
        ***SEMPRE*** usar camelCase no front e no back
    </critico>

</requirements>
