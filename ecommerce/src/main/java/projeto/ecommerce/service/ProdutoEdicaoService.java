package projeto.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import projeto.ecommerce.dto.ProdutoDetalheDTO;
import projeto.ecommerce.dto.ProdutoUpdateRequest;
import projeto.ecommerce.model.Produto;
import projeto.ecommerce.model.ProdutoImagem;
import projeto.ecommerce.repository.ProdutoImagemRepository;
import projeto.ecommerce.repository.ProdutoRepository;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProdutoEdicaoService {

    private final ProdutoRepository produtoRepo;
    private final ProdutoImagemRepository imgRepo;

    private File pastaProduto(Long id){
        return new File(System.getProperty("user.dir"), "uploads/produtos/" + id);
    }

    public ProdutoDetalheDTO detalhar(Long id){
        Produto p = produtoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));
        var imgs = p.getImagens().stream()
                .sorted(Comparator.comparing(ProdutoImagem::getOrdem).thenComparing(ProdutoImagem::getId))
                .map(pi -> new ProdutoDetalheDTO.ImagemDTO(pi.getId(), pi.getArquivo(), pi.getPrincipal(), pi.getOrdem()))
                .toList();
        return new ProdutoDetalheDTO(
                p.getId(), p.getCodigo(), p.getNome(), p.getValor(), p.getQuantidade(),
                p.getDescricao(), p.getAvaliacao(), p.getAtivo(), imgs
        );
    }

    @Transactional
    public Produto atualizar(Long id, ProdutoUpdateRequest req){
        var p = produtoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        if (req.avaliacao()!=null) {
            BigDecimal a = req.avaliacao();
            if (a.compareTo(new BigDecimal("1.0"))<0 || a.compareTo(new BigDecimal("5.0"))>0)
                throw new IllegalArgumentException("Avaliação deve estar entre 1.0 e 5.0");
        }

        p.setCodigo(req.codigo());
        p.setNome(req.nome());
        p.setValor(req.valor());
        p.setQuantidade(req.quantidade());
        p.setDescricao(req.descricao());
        p.setAvaliacao(req.avaliacao());
        p.setAtivo(req.ativo());
        return produtoRepo.save(p);
    }

    @Transactional
    public void adicionarImagens(Long id, List<MultipartFile> novas, Integer principalIndex) throws IOException {
        var p = produtoRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Produto não encontrado"));

        int ordem = p.getImagens().stream()
                .map(ProdutoImagem::getOrdem)
                .max(Integer::compareTo).orElse(0) + 1;

        var dir = pastaProduto(id);
        if (!dir.exists()) Files.createDirectories(dir.toPath());

        int i = 0;
        for (MultipartFile mf : novas){
            if (mf==null || mf.isEmpty()) { i++; continue; }

            String ext = "";
            String original = mf.getOriginalFilename();
            if (original!=null && original.contains(".")) ext = original.substring(original.lastIndexOf("."));
            String nomeArq = UUID.randomUUID() + ext;

            var destino = new File(dir, nomeArq);
            mf.transferTo(destino);

            String relativo = "uploads/produtos/" + id + "/" + nomeArq;
            boolean principal = (principalIndex!=null && principalIndex==i);

            var img = ProdutoImagem.builder()
                    .produto(p).arquivo(relativo).principal(principal).ordem(ordem++)
                    .build();
            imgRepo.save(img);

            i++;
        }

        // garante que exista uma principal
        if (p.getImagens().stream().noneMatch(ProdutoImagem::getPrincipal)) {
            p.getImagens().stream()
                    .min(Comparator.comparing(ProdutoImagem::getOrdem))
                    .ifPresent(pi -> { pi.setPrincipal(true); imgRepo.save(pi); });
        }
    }

    @Transactional
    public void removerImagem(Long produtoId, Long imagemId){
        var img = imgRepo.findById(imagemId)
                .orElseThrow(() -> new RuntimeException("Imagem não encontrada"));
        if (!img.getProduto().getId().equals(produtoId))
            throw new RuntimeException("Imagem não pertence ao produto");

        try { new File(System.getProperty("user.dir"), img.getArquivo()).delete(); } catch (Exception ignored) {}
        boolean eraPrincipal = Boolean.TRUE.equals(img.getPrincipal());
        imgRepo.delete(img);

        if (eraPrincipal) {
            var restantes = imgRepo.findAll().stream()
                    .filter(pi -> pi.getProduto().getId().equals(produtoId))
                    .sorted(Comparator.comparing(ProdutoImagem::getOrdem))
                    .toList();
            if (!restantes.isEmpty()){
                var first = restantes.get(0);
                first.setPrincipal(true);
                imgRepo.save(first);
            }
        }
    }

    @Transactional
    public void tornarPrincipal(Long produtoId, Long imagemId){
        var lista = imgRepo.findAll().stream()
                .filter(i -> i.getProduto().getId().equals(produtoId))
                .toList();
        for (var pi : lista) {
            pi.setPrincipal(pi.getId().equals(imagemId));
            imgRepo.save(pi);
        }
    }
}
