package projeto.ecommerce.model;

public enum StatusPedido {

    // carrinho ainda não finalizado (Sprint 3/5)
    CARRINHO,

    // após finalizar checkout, aguardando pagamento (Sprint 5)
    AGUARDANDO_PAGAMENTO,

    // pagamento confirmado
    PAGO,

    // pedido despachado
    ENVIADO,

    // pedido entregue ao cliente
    ENTREGUE,

    // pedido cancelado
    CANCELADO
}
