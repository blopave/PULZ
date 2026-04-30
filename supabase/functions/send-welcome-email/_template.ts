// Welcome email — sent automatically by send-welcome-email edge function
// when a user confirms their email for the first time.
// Three role-specific variants: runner (default), team, organizer.

const HEAD = `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="color-scheme" content="dark only">
<meta name="supported-color-schemes" content="dark only">
<title>PULZ — Bienvenido</title>
<style>
    :root { color-scheme: dark only; supported-color-schemes: dark only; }
    body, table, td, a, h1, h2, h3, p, div, strong { color-scheme: dark only !important; }
    [data-ogsc] body, [data-ogsb] body { background: #0A0A0C !important; }
    [data-ogsc] td, [data-ogsb] td { color: #EEEAE5 !important; }
    @media (prefers-color-scheme: light) {
        body, table { background: #0A0A0C !important; }
    }
    u + .body .gmail-fix { display:none !important; }
    @media only screen and (max-width: 600px) {
        .container { width: 100% !important; padding: 24px 20px !important; }
        .hero-title { font-size: 38px !important; line-height: 1.05 !important; }
        .stat-num { font-size: 28px !important; }
        .feature-card { padding: 16px !important; }
        .cta-btn { display: block !important; width: auto !important; padding: 16px 24px !important; }
    }
</style>
</head>
<body class="body" style="margin:0;padding:0;background:#0A0A0C;font-family:'Helvetica Neue','Inter',Arial,sans-serif;color:#EEEAE5;-webkit-font-smoothing:antialiased;">

<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:#0A0A0C;">
    Tu cuenta está activa. Bienvenido a la plataforma runner de Latinoamérica.
</div>

<table width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="#0A0A0C" style="background:#0A0A0C;">
<tr><td align="center" style="padding:48px 20px;">

<table class="container" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;background:#0A0A0C;">

    <tr><td style="padding-bottom:48px;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-size:0;line-height:0;mso-line-height-rule:exactly;" valign="middle">
                <div style="width:14px;height:14px;background:#DEFF00;border-radius:50%;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</div>
            </td>
            <td style="padding-left:10px;font-size:13px;font-weight:700;letter-spacing:4px;color:#EEEAE5;" valign="middle">PULZ</td>
        </tr></table>
    </td></tr>`;

const HERO_RUNNER = `
    <tr><td style="padding:0 0 8px;">
        <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:3px;color:#DEFF00;text-transform:uppercase;">Bienvenido</p>
    </td></tr>
    <tr><td style="padding:0 0 24px;">
        <h1 class="hero-title" style="margin:0;font-size:48px;font-weight:800;line-height:1.05;letter-spacing:-1px;color:#EEEAE5;">
            Ya sos parte<br>de <span style="color:#DEFF00;">PULZ</span>.
        </h1>
    </td></tr>

    <tr><td style="padding:0 0 32px;">
        <p style="margin:0;font-size:17px;line-height:1.7;color:#9E9B93;max-width:480px;">
            Acabás de unirte a la plataforma runner más grande de Latinoamérica. A partir de hoy, todas las carreras del continente están a un click.
        </p>
    </td></tr>`;

const HERO_TEAM = `
    <tr><td style="padding:0 0 8px;">
        <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:3px;color:#DEFF00;text-transform:uppercase;">Bienvenidos</p>
    </td></tr>
    <tr><td style="padding:0 0 24px;">
        <h1 class="hero-title" style="margin:0;font-size:48px;font-weight:800;line-height:1.05;letter-spacing:-1px;color:#EEEAE5;">
            Tu equipo<br>ya corre con <span style="color:#DEFF00;">PULZ</span>.
        </h1>
    </td></tr>

    <tr><td style="padding:0 0 32px;">
        <p style="margin:0;font-size:17px;line-height:1.7;color:#9E9B93;max-width:480px;">
            Acabás de registrar tu running team en la plataforma runner más grande de Latinoamérica. Ahora podés organizar a tus miembros, marcar carreras y conectar con runners de toda la región.
        </p>
    </td></tr>`;

const HERO_ORG = `
    <tr><td style="padding:0 0 8px;">
        <p style="margin:0;font-size:13px;font-weight:700;letter-spacing:3px;color:#DEFF00;text-transform:uppercase;">Bienvenido organizador</p>
    </td></tr>
    <tr><td style="padding:0 0 24px;">
        <h1 class="hero-title" style="margin:0;font-size:48px;font-weight:800;line-height:1.05;letter-spacing:-1px;color:#EEEAE5;">
            Tu carrera<br>ya tiene casa en <span style="color:#DEFF00;">PULZ</span>.
        </h1>
    </td></tr>

    <tr><td style="padding:0 0 32px;">
        <p style="margin:0;font-size:17px;line-height:1.7;color:#9E9B93;max-width:480px;">
            Acabás de unirte a la plataforma runner más grande de Latinoamérica. Publicar tu carrera te conecta con runners de 7 países que arman su próxima temporada.
        </p>
    </td></tr>`;

const FOUNDING_STAGE = `
    <tr><td style="padding:0 0 40px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#121113;border:1px solid #1E1E22;border-radius:14px;">
            <tr><td style="padding:28px 24px;">
                <p style="margin:0 0 14px;font-size:11px;color:#DEFF00;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Etapa fundacional</p>
                <p style="margin:0 0 14px;font-size:16px;line-height:1.7;color:#EEEAE5;font-weight:500;">
                    Estás entrando en una etapa especial. Durante esta fase, todas las funciones de PULZ están abiertas: queremos que la comunidad use la plataforma a fondo y que ese uso real nos ayude a darle forma.
                </p>
                <p style="margin:0 0 14px;font-size:15px;line-height:1.7;color:#9E9B93;">
                    Más adelante vamos a lanzar planes diferenciados &mdash; una versión free con lo esencial, y planes pagos con funcionalidades avanzadas para quienes necesiten más. Lo vamos a anunciar con tiempo, sin sorpresas.
                </p>
                <p style="margin:0;font-size:15px;line-height:1.7;color:#9E9B93;">
                    Si en el camino tenés feedback o ideas, escribinos a <a href="mailto:hola@pulz.run" style="color:#DEFF00;text-decoration:none;font-weight:600;">hola@pulz.run</a>. En esta etapa, cada mensaje pesa.
                </p>
            </td></tr>
        </table>
    </td></tr>`;

const DIVIDER = `
    <tr><td style="padding:0 0 40px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%"><tr>
            <td style="border-top:1px solid #1E1E22;height:1px;line-height:1px;font-size:0;">&nbsp;</td>
            <td style="padding:0 12px;font-size:0;line-height:0;mso-line-height-rule:exactly;" valign="middle">
                <div style="width:8px;height:8px;background:#DEFF00;border-radius:50%;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</div>
            </td>
            <td style="border-top:1px solid #1E1E22;height:1px;line-height:1px;font-size:0;">&nbsp;</td>
        </tr></table>
    </td></tr>`;

function featureCard(icon: string, title: string, body: string): string {
    return `
    <tr><td style="padding:0 0 12px;">
        <table class="feature-card" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#121113;border:1px solid #1E1E22;border-radius:12px;">
            <tr><td style="padding:20px;">
                <table cellpadding="0" cellspacing="0" border="0"><tr>
                    <td width="44" height="44" style="width:44px;height:44px;background:#1C1B19;border:1px solid #24232A;border-radius:10px;text-align:center;vertical-align:middle;font-size:18px;color:#DEFF00;line-height:44px;mso-line-height-rule:exactly;">${icon}</td>
                    <td style="padding-left:16px;vertical-align:middle;">
                        <div style="font-size:15px;font-weight:700;color:#EEEAE5;letter-spacing:-0.2px;">${title}</div>
                        <div style="font-size:13px;color:#8A8780;margin-top:4px;line-height:1.6;">${body}</div>
                    </td>
                </tr></table>
            </td></tr>
        </table>
    </td></tr>`;
}

const FEATURES_HEADER = `
    <tr><td style="padding:0 0 16px;">
        <p style="margin:0;font-size:11px;color:#7A7770;letter-spacing:3px;text-transform:uppercase;font-weight:700;">Qué podés hacer ahora</p>
    </td></tr>`;

const FEATURES_RUNNER = FEATURES_HEADER
    + featureCard("&#9829;", "Guardá tus carreras", "Marcá las que te interesan y armá tu temporada en un solo lugar.")
    + featureCard("&#128197;", "Armá tu calendario", "Exportá a Google Calendar y recibí avisos cuando abre la inscripción.")
    + featureCard("&#127942;", "Construí tu Passport", "Tu mapa runner: sellos por país, carreras completadas y badges desbloqueados.")
    + featureCard("&#9733;", "Dejá tu experiencia", "Compartí reviews y ayudá a otros runners a elegir su próxima carrera.");

const FEATURES_TEAM = FEATURES_HEADER
    + featureCard("&#128101;", "Armá tu equipo", "Perfil público con nombre, ciudad, modalidad y redes. Un link para que se sumen runners.")
    + featureCard("&#128197;", "Calendario compartido", "Marcá las carreras donde van a correr. Todos los miembros lo ven en un solo calendario.")
    + featureCard("&#128200;", "Stats del equipo", "Km acumulados, carreras completadas, leaderboard interno y desafíos del mes.")
    + featureCard("&#128227;", "Anuncios del team", "Comunicá a tus miembros: punto de encuentro, viajes, novedades. Todo en un lugar.");

const FEATURES_ORG = FEATURES_HEADER
    + featureCard("&#127937;", "Publicá tu carrera", "Cargá los datos: fecha, distancias, ubicación e inscripción. En minutos está visible.")
    + featureCard("&#127758;", "Llegá a toda Latinoamérica", "Tu carrera visible en 7 países, frente a runners que arman su temporada.")
    + featureCard("&#128202;", "Trackeá tu performance", "Analytics de clicks a tu inscripción, runners interesados y origen geográfico.")
    + featureCard("&#128227;", "Avisá a tus interesados", "Mandá novedades a los runners que guardaron tu carrera. Últimos cupos, cambios de ruta, lo que sea.");

const HINT_RUNNER = `
    <tr><td align="center" style="padding:0 0 40px;">
        <p style="margin:0;font-size:13px;color:#7A7770;line-height:1.6;font-style:italic;">
            Y muchas más funciones para descubrir mientras explorás el sitio.
        </p>
    </td></tr>`;

const HINT_TEAM = `
    <tr><td align="center" style="padding:0 0 40px;">
        <p style="margin:0;font-size:13px;color:#7A7770;line-height:1.6;font-style:italic;">
            Cuanto más activo tu equipo, más visible se vuelve para nuevos miembros.
        </p>
    </td></tr>`;

const HINT_ORG = `
    <tr><td align="center" style="padding:0 0 40px;">
        <p style="margin:0;font-size:13px;color:#7A7770;line-height:1.6;font-style:italic;">
            Publicar es gratis. Siempre.
        </p>
    </td></tr>`;

function ctaSection(label: string, secondaryLabel: string, secondaryHref: string): string {
    return `
    <tr><td align="center" style="padding:0 0 14px;">
        <a href="https://pulz.run" class="cta-btn" style="display:inline-block;background:#DEFF00;color:#0A0A0C;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:0.3px;padding:16px 36px;border-radius:10px;">
            ${label} &nbsp;&rarr;
        </a>
    </td></tr>

    <tr><td align="center" style="padding:0 0 48px;">
        <a href="${secondaryHref}" style="display:inline-block;color:#EEEAE5;text-decoration:none;font-size:14px;font-weight:600;padding:10px 16px;border-bottom:1px solid #2A2A30;">
            ${secondaryLabel}
        </a>
    </td></tr>`;
}

const CTA_RUNNER = ctaSection("Explorar carreras", "Completar mi perfil", "https://pulz.run/#profile");
const CTA_TEAM = ctaSection("Ir a mi equipo", "Marcar nuestras carreras", "https://pulz.run");
const CTA_ORG = ctaSection("Publicar mi carrera", "Ver el calendario", "https://pulz.run");

const STATS_BLOCK = `
    <tr><td style="padding:0 0 40px;">
        <table cellpadding="0" cellspacing="0" border="0" width="100%" style="background:#121113;border:1px solid #1E1E22;border-radius:14px;">
            <tr><td style="padding:28px 20px;">
                <p style="margin:0 0 16px;font-size:11px;color:#7A7770;letter-spacing:3px;text-transform:uppercase;font-weight:700;text-align:center;">Te sumás a una comunidad de</p>
                <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                    <td align="center" style="padding:4px 8px;border-right:1px solid #1E1E22;">
                        <div class="stat-num" style="font-size:34px;font-weight:800;color:#DEFF00;line-height:1;letter-spacing:-1px;">7</div>
                        <div style="font-size:10px;color:#7A7770;letter-spacing:2px;text-transform:uppercase;margin-top:8px;font-weight:600;">Países</div>
                    </td>
                    <td align="center" style="padding:4px 8px;border-right:1px solid #1E1E22;">
                        <div class="stat-num" style="font-size:34px;font-weight:800;color:#DEFF00;line-height:1;letter-spacing:-1px;">380+</div>
                        <div style="font-size:10px;color:#7A7770;letter-spacing:2px;text-transform:uppercase;margin-top:8px;font-weight:600;">Carreras</div>
                    </td>
                    <td align="center" style="padding:4px 8px;">
                        <div class="stat-num" style="font-size:34px;font-weight:800;color:#DEFF00;line-height:1;letter-spacing:-1px;">3</div>
                        <div style="font-size:10px;color:#7A7770;letter-spacing:2px;text-transform:uppercase;margin-top:8px;font-weight:600;">Idiomas</div>
                    </td>
                </tr>
                </table>
            </td></tr>
        </table>
    </td></tr>

    <tr><td align="center" style="padding:0 0 40px;">
        <p style="margin:0;font-size:20px;font-style:italic;font-weight:300;color:#EEEAE5;line-height:1.4;letter-spacing:-0.3px;">"Nos vemos en la largada."</p>
    </td></tr>`;

const FOOTER = `
    <tr><td style="padding:0 0 32px;">
        <div style="border-top:1px solid #1E1E22;height:1px;line-height:1px;font-size:0;">&nbsp;</div>
    </td></tr>

    <tr><td style="padding:0 0 32px;">
        <p style="margin:0;font-size:14px;line-height:1.7;color:#9E9B93;">
            Si tenés alguna pregunta, respondé este mail o escribinos a <a href="mailto:hola@pulz.run" style="color:#DEFF00;text-decoration:none;font-weight:600;">hola@pulz.run</a>.
        </p>
        <p style="margin:18px 0 0;font-size:14px;line-height:1.7;color:#9E9B93;">
            <strong style="color:#EEEAE5;font-weight:700;">El equipo de PULZ</strong>
        </p>
    </td></tr>

    <tr><td style="padding:24px 0 0;border-top:1px solid #1E1E22;">
        <table cellpadding="0" cellspacing="0" border="0"><tr>
            <td style="font-size:0;line-height:0;mso-line-height-rule:exactly;" valign="middle">
                <div style="width:8px;height:8px;background:#DEFF00;border-radius:50%;opacity:0.6;font-size:0;line-height:0;mso-line-height-rule:exactly;">&nbsp;</div>
            </td>
            <td style="padding-left:8px;font-size:11px;letter-spacing:3px;color:#6E6D65;font-weight:700;" valign="middle">PULZ</td>
        </tr></table>
        <p style="margin:10px 0 0;font-size:11px;color:#6E6D65;line-height:1.7;">
            La plataforma runner de Latinoamérica<br>
            <a href="https://pulz.run" style="color:#7A7770;text-decoration:none;">pulz.run</a> &nbsp;&middot;&nbsp; <a href="mailto:hola@pulz.run" style="color:#7A7770;text-decoration:none;">hola@pulz.run</a>
        </p>
        <p style="margin:18px 0 0;font-size:10px;color:#5A5953;line-height:1.6;">
            Recibís este mail porque te registraste en pulz.run.
        </p>
    </td></tr>

</table>

</td></tr>
</table>

</body>
</html>`;

export function welcomeHtml(role: string): string {
    if (role === "organizer") {
        return HEAD + HERO_ORG + FOUNDING_STAGE + DIVIDER + FEATURES_ORG + HINT_ORG + CTA_ORG + STATS_BLOCK + FOOTER;
    }
    if (role === "team") {
        return HEAD + HERO_TEAM + FOUNDING_STAGE + DIVIDER + FEATURES_TEAM + HINT_TEAM + CTA_TEAM + STATS_BLOCK + FOOTER;
    }
    return HEAD + HERO_RUNNER + FOUNDING_STAGE + DIVIDER + FEATURES_RUNNER + HINT_RUNNER + CTA_RUNNER + STATS_BLOCK + FOOTER;
}

export function welcomeSubject(role: string): string {
    if (role === "organizer") return "Tu carrera ya tiene casa en PULZ";
    if (role === "team") return "Tu running team ya corre con PULZ";
    return "Ya sos parte de PULZ";
}
