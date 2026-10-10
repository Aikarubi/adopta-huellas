document.addEventListener("DOMContentLoaded", () => {
    const menuButton = document.querySelector(".nav-toggle");
    const navigation = document.querySelector(".nav-links");
    const header = document.querySelector("header");

    if (!navigation) return;

    // MENÚ MÓVIL
    const closeMenu = () => {
        navigation.classList.remove("is-open");
        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Abrir menú");
        }
    };

    const openMenu = () => {
        navigation.classList.add("is-open");
        if (menuButton) {
            menuButton.setAttribute("aria-expanded", "true");
            menuButton.setAttribute("aria-label", "Cerrar menú");
        }
    };

    if (menuButton) {
        menuButton.addEventListener("click", () => {
            const isOpen = menuButton.getAttribute("aria-expanded") === "true";
            if (isOpen) closeMenu();
            else openMenu();
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape") {
                closeMenu();
                menuButton.focus();
            }
        });

        document.addEventListener("click", (event) => {
            const clickedInsideMenu = navigation.contains(event.target);
            const clickedButton = menuButton.contains(event.target);
            if (!clickedInsideMenu && !clickedButton) closeMenu();
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 820) closeMenu();
        });
    }

    // Cerrar el menú al elegir un enlace. La transición se hace en CSS;
    // el enlace conserva el comportamiento nativo de scroll suave.
    navigation.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            if (menuButton) closeMenu();
        });
    });

    // ENLACE ACTIVO DURANTE TODA LA SECCIÓN
    const currentFile = (() => {
        const path = window.location.pathname;
        return path.endsWith("/") ? "index.html" : path.split("/").pop();
    })();

    const sectionLinks = [...navigation.querySelectorAll('a[href*="#"]')].filter((link) => {
        const url = new URL(link.href, window.location.href);
        const targetFile = url.pathname.endsWith("/")
            ? "index.html"
            : url.pathname.split("/").pop();
        const targetId = decodeURIComponent(url.hash.slice(1));

        return targetFile === currentFile && targetId && document.getElementById(targetId);
    });

    const trackedSections = sectionLinks
        .map((link) => document.getElementById(decodeURIComponent(new URL(link.href).hash.slice(1))))
        .filter((section, index, list) => section && list.indexOf(section) === index)
        .sort((a, b) => a.offsetTop - b.offsetTop);

    const setActiveLink = (sectionId) => {
        sectionLinks.forEach((link) => {
            const targetId = decodeURIComponent(new URL(link.href).hash.slice(1));
            const active = targetId === sectionId;
            link.classList.toggle("active", active);

            if (active) {
                link.setAttribute("aria-current", "location");
            } else if (link.getAttribute("aria-current") === "location") {
                link.removeAttribute("aria-current");
            }
        });
    };

    if (trackedSections.length) {
        let scheduled = false;

        const updateActiveSection = () => {
            scheduled = false;
            const headerHeight = header ? header.getBoundingClientRect().height : 0;
            const activationLine = headerHeight + 20;
            const footer = document.querySelector("footer");

            // El footer es el cierre/contacto, no una opción de navegación.
            // Al entrar en él dejamos de marcar una sección del contenido como activa.
            if (footer && footer.getBoundingClientRect().top <= activationLine) {
                sectionLinks.forEach((link) => {
                    link.classList.remove("active");
                    if (link.getAttribute("aria-current") === "location") {
                        link.removeAttribute("aria-current");
                    }
                });
                return;
            }

            let activeSection = trackedSections[0];
            for (const section of trackedSections) {
                if (section.getBoundingClientRect().top <= activationLine) {
                    activeSection = section;
                } else {
                    break;
                }
            }

            if (activeSection) setActiveLink(activeSection.id);
        };

        const scheduleUpdate = () => {
            if (scheduled) return;
            scheduled = true;
            window.requestAnimationFrame(updateActiveSection);
        };

        window.addEventListener("scroll", scheduleUpdate, { passive: true });
        window.addEventListener("resize", scheduleUpdate);
        window.addEventListener("hashchange", scheduleUpdate);
        updateActiveSection();
    }

    // En páginas interiores, mantener marcado el enlace de la página actual.
    const currentPageLink = [...navigation.querySelectorAll("a")].find((link) => {
        const url = new URL(link.href, window.location.href);
        const targetFile = url.pathname.endsWith("/")
            ? "index.html"
            : url.pathname.split("/").pop();
        return targetFile === currentFile && !url.hash;
    });

    if (currentPageLink && !currentPageLink.classList.contains("active")) {
        currentPageLink.classList.add("active");
        currentPageLink.setAttribute("aria-current", "page");
    }
});
