package projeto.ecommerce.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.Set;

@Component
@Order(1)
public class RoleGuardFilter extends OncePerRequestFilter {

    private static final Set<String> ADMIN_PAGES = Set.of("/principal.html", "/usuario.html");
    private static boolean isAdminApi(String path){ return path.startsWith("/api/usuarios"); }
    private static boolean isHtml(String path){ return path.endsWith(".html"); }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws ServletException, IOException {

        // evita reexibir HTML pelo histórico/cache
        if (isHtml(req.getRequestURI())) {
            res.setHeader("Cache-Control","no-store, no-cache, must-revalidate, max-age=0");
            res.setHeader("Pragma","no-cache");
            res.setDateHeader("Expires", 0);
        }

        HttpSession s = req.getSession(false);
        String perfil = s == null ? null : String.valueOf(s.getAttribute("USER_PERFIL"));
        String path = req.getRequestURI();

        // protegemos páginas/admin e APIs de usuários
        if ((ADMIN_PAGES.contains(path) || isAdminApi(path)) && !"Administrador".equals(perfil)) {
            if (path.startsWith("/api/")) { res.sendError(HttpServletResponse.SC_FORBIDDEN,"Acesso restrito ao Administrador"); }
            else { res.sendRedirect("/principal-estoque.html"); }
            return;
        }
        chain.doFilter(req, res);
    }
}
