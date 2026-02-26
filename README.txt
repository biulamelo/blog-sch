BLOG SCH — CMS + PUBLICAÇÃO DIÁRIA (SEM CUSTO FIXO)

O que foi integrado neste ZIP:
- Eleventy (build automático)
- Decap CMS em /admin
- Netlify Identity (login)
- Stripe (a configurar) + Function /premium (gate por role "premium")

Como publicar:
1) Conectar este repositório ao Netlify (GitHub)
2) No Netlify:
   - Site settings → Identity: Enable Identity
   - Identity → Services → Git Gateway: Enable
   - Identity → Registration: definir convite/aberto (recomendado: Invite only)
3) Acessar /admin e criar posts.

Premium:
- A Function /premium libera apenas para usuários com role "premium".
- Você precisará criar a assinatura no Stripe e, via webhook, atribuir a role "premium" aos assinantes (a etapa Stripe/webhook é a próxima fase).

Build:
- Publish directory: _site
- Build command: npm run build