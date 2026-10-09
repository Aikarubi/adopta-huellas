
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = [...document.querySelectorAll(".nav-links a")];

    if (!navLinks.length) return;

    const currentPage =
        window.location.pathname.split("/").pop() || "index.html";

    // Nos quedamos con los enlaces que apuntan a esta página.
    const pageLinks = navLinks.filter((link) => {
        const url = new URL(link.href, window.location.href);
        const linkPage = url.pathname.split("/").pop() || "index.html";

        return linkPage === currentPage;
    });

    const sectionLinks = pageLinks.filter((link) => {
        return link.hash && document.querySelector(link.hash);
    });

    function setActiveLink(id) {
        sectionLinks.forEach((link) => {
            link.classList.toggle("active", link.hash === `#${id}`);
        });
    }

    // En páginas como Nosotros, marcamos el enlace de la página actual.
    if (!sectionLinks.length) {
        const currentLink = navLinks.find((link) => {
            const url = new URL(link.href, window.location.href);
            return (
                (url.pathname.split("/").pop() || "index.html") === currentPage
            );
        });

        currentLink?.classList.add("active");
        return;
    }

    // Detectamos qué sección está entrando en la zona de lectura.
    const observer = new IntersectionObserver(
        (entries) => {
            const visibleSections = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

            if (visibleSections.length) {
                setActiveLink(visibleSections[0].target.id);
            }
        },
        {
            rootMargin: "-20% 0px -60% 0px",
            threshold: [0, 0.1, 0.25, 0.5]
        }
    );

    sectionLinks.forEach((link) => {
        observer.observe(document.querySelector(link.hash));
    });

    // Actualizamos el estado al pulsar una opción de la navegación.
    sectionLinks.forEach((link) => {
        link.addEventListener("click", () => {
            setActiveLink(link.hash.slice(1));
        });
    });
});