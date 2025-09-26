// src/main/java/projeto/ecommerce/service/ProdutoService.java
package projeto.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import projeto.ecommerce.dto.ProdutoListDTO;
import projeto.ecommerce.model.Produto;
import projeto.ecommerce.repository.ProdutoRepository;

@Service @RequiredArgsConstructor
public class ProdutoService {
    private final ProdutoRepository repo;

    public Page<ProdutoListDTO> listar(String q, Boolean ativo, Integer page, Integer size) {
        // Critério: listar últimos inseridos (decrescente por criadoEm)
        int p = (page == null || page < 0) ? 0 : page;
        int s = (size == null || size <= 0) ? 10 : size; // máx. 10 por página
        Pageable pageable = PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "criadoEm"));

        return repo.search(q, ativo, pageable)
                   .map(pdt -> new ProdutoListDTO(
                       pdt.getId(), pdt.getCodigo(), pdt.getNome(),
                       pdt.getQuantidade(), pdt.getValor(), pdt.getAtivo()
                   ));
    }

    public Produto detalhar(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("Produto não encontrado"));
    }

    public void ativar(Long id) {
        var p = detalhar(id);
        p.setAtivo(true);
        repo.save(p);
    }

    public void inativar(Long id) {
        var p = detalhar(id);
        p.setAtivo(false);
        repo.save(p);
    }

    public void atualizarQuantidade(Long id, Integer quantidade){
        if (quantidade == null || quantidade < 0) {
            throw new IllegalArgumentException("Quantidade inválida");
        }
        Produto p = detalhar(id); // reaproveita método que lança not found
        p.setQuantidade(quantidade);
        repo.save(p);
    }
}
