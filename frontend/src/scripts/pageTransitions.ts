document.addEventListener("DOMContentLoaded", () => {
    const main = document.getElementById("page-main") as HTMLElement | null;
    const links = document.querySelectorAll("a[href]");
  
    if (!main) return;
  
    // Trigger fade-in after load
    requestAnimationFrame(() => {
      main.classList.add("fade-slide-in-active");
    });
  
    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        const href = (link as HTMLAnchorElement).getAttribute("href");
        if (!href || !href.startsWith("/") || href === window.location.pathname) return;
  
        e.preventDefault();
        main.classList.remove("fade-slide-in", "fade-slide-in-active");
        main.classList.add("fade-slide-out");
  
        requestAnimationFrame(() => {
          main.classList.add("fade-slide-out-active");
        });
  
        setTimeout(() => {
          window.location.href = href;
        }, 500);
      });
    });
  });
