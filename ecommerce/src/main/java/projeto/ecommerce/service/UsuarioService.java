package projeto.ecommerce.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import projeto.ecommerce.dto.UsuarioCreateDTO;
import projeto.ecommerce.dto.UsuarioUpdateDTO;
import projeto.ecommerce.model.Usuario;
import projeto.ecommerce.repository.UsuarioRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UsuarioService {
    private final UsuarioRepository repo;
    private final SecurityService security;

    @Transactional
    public Usuario criar(UsuarioCreateDTO dto){
        if(repo.existsByEmail(dto.email())) throw new IllegalArgumentException("E-mail já cadastrado");
        if(repo.existsByCpf(dto.cpf())) throw new IllegalArgumentException("CPF já cadastrado");
        // (opcional) validar CPF com dígitos verificadores

        Usuario u = new Usuario();
        u.setNome(dto.nome());
        u.setCpf(dto.cpf());
        u.setEmail(dto.email().toLowerCase());
        u.setPerfil(dto.perfil());
        u.setAtivo(true);
        u.setSenha(security.encryptPassword(dto.senha()));
        return repo.save(u);
    }

    @Transactional
    public Usuario atualizar(Long id, UsuarioUpdateDTO dto){
        Usuario u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        u.setNome(dto.nome());
        u.setCpf(dto.cpf());
        u.setPerfil(dto.perfil());
        if(dto.novaSenha()!=null && !dto.novaSenha().isEmpty()){
            u.setSenha(security.encryptPassword(dto.novaSenha()));
        }
        return repo.save(u);
    }

    @Transactional
    public Usuario alternarStatus(Long id){
        Usuario u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado"));
        u.setAtivo(!u.isAtivo());
        return repo.save(u);
    }

    public List<Usuario> listar(String filtroNome){
        if(filtroNome==null || filtroNome.trim().isEmpty()) return repo.findAll();
        return repo.findByNomeContainingIgnoreCaseOrderByNomeAsc(filtroNome.trim());
    }

    public Usuario buscarPorEmail(String email){
        return repo.findByEmail(email.toLowerCase()).orElse(null);
    }
}
