const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const { marked } = require("marked");

function json(statusCode, body) {
  return {
    statusCode,
    headers: { "content-type": "application/json; charset=utf-8" },
    body: JSON.stringify(body),
  };
}

exports.handler = async (event, context) => {
  try {
    const user = context.clientContext && context.clientContext.user;
    if (!user) {
      return { statusCode: 401, body: "Faça login para acessar conteúdo premium." };
    }

    const roles = (user.app_metadata && user.app_metadata.roles) || [];
    if (!roles.includes("premium")) {
      return { statusCode: 403, body: "Acesso premium necessário (assinatura)." };
    }

    const slug = (event.queryStringParameters && event.queryStringParameters.slug) || "";
    if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      return { statusCode: 400, body: "Slug inválido." };
    }

    const filePath = path.join(__dirname, "..", "..", "..", "content", "premium", `${slug}.md`);
    if (!fs.existsSync(filePath)) {
      return { statusCode: 404, body: "Post premium não encontrado." };
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = matter(raw);
    const html = marked.parse(parsed.content);

    return json(200, {
      title: parsed.data.title || "Premium",
      category: parsed.data.category || "Premium",
      html,
    });
  } catch (e) {
    return { statusCode: 500, body: "Erro interno." };
  }
};