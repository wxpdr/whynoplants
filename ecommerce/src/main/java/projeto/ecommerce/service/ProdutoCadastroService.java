package projeto.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import projeto.ecommerce.dto.ProdutoCreateRequest;
import projeto.ecommerce.model.Produto;
import projeto.ecommerce.model.ProdutoImagem;
import projeto.ecommerce.repository.ProdutoImagemRepository;
import projeto.ecommerce.repository.ProdutoRepository;

import java.io.File;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProdutoCadastroService {

    private final ProdutoRepository produtoRepo;
    private final ProdutoImagemRepository imgRepo;

    // Ex.: <projeto>/uploads/produtos/<id>
    private File pastaProduto(Long id) {
        return new File(System.getProperty("user.dir"), "uploads/produtos/" + id);
    }

    public Produto criar(ProdutoCreateRequest req, List<MultipartFile> imagens) throws IOException {
        // validação simples da avaliação
        if (req.avaliacao() != null) {
            BigDecimal a = req.avaliacao();
            if (a.compareTo(new BigDecimal("1.0")) < 0 || a.compareTo(new BigDecimal("5.0")) > 0) {
                throw new IllegalArgumentException("Avaliação deve estar entre 1.0 e 5.0");
            }
        }

        // cria e salva o produto
        var p = Produto.builder()
                .codigo(req.codigo())
                .nome(req.nome())
                .quantidade(req.quantidade())
                .valor(req.valor())
                .descricao(req.descricao())
                .avaliacao(req.avaliacao())
                .ativo(true)
                .criadoEm(LocalDateTime.now())
                .build();
        p = produtoRepo.save(p);

        // salva imagens (opcional)
        boolean marcouPrincipalNoLoop = false;
        List<ProdutoImagem> criadas = new ArrayList<>();

        if (imagens != null && !imagens.isEmpty()) {
            var dir = pastaProduto(p.getId());
            if (!dir.exists()) Files.createDirectories(dir.toPath());

            int ordem = 0;
            for (int i = 0; i < imagens.size(); i++) {
                MultipartFile mf = imagens.get(i);
                if (mf.isEmpty()) continue;

                String ext = "";
                String original = mf.getOriginalFilename();
                if (original != null && original.contains(".")) {
                    ext = original.substring(original.lastIndexOf(".")); // <<< corrigido
                }
                String nomeArq = UUID.randomUUID() + ext;
                File destino = new File(dir, nomeArq);
                mf.transferTo(destino);

                String relativo = "uploads/produtos/" + p.getId() + "/" + nomeArq; // <<< corrigido

                boolean principal = (req.principalIndex() != null && req.principalIndex() == i);
                if (principal) marcouPrincipalNoLoop = true;

                var img = ProdutoImagem.builder()
                        .produto(p)
                        .arquivo(relativo)       // <<< corrigido
                        .principal(principal)
                        .ordem(ordem++)
                        .build();

                imgRepo.save(img);
                criadas.add(img);
            }

            // se nenhuma imagem foi marcada como principal, define a primeira criada
            if (!marcouPrincipalNoLoop && !criadas.isEmpty()) {
                var first = criadas.get(0);
                first.setPrincipal(true);
                imgRepo.save(first);
            }
        }

        return p;
    }
}
