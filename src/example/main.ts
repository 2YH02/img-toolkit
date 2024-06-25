import "./style.css";
import resizePage from "./pages/resize-page/resize-page";
import editPage from "./pages/edit-page/edit-page";

const routes: { [key: string]: { content: string; scripts?: VoidFunction[] } } =
  {
    "/": resizePage,
    "/edit": editPage,
  };

const render = () => {
  const app = document.getElementById("app");
  const hash = window.location.hash || "#/";
  const path = hash.substring(1);
  const pageContent = routes[path] || "Page Not Found";

  if (app) {
    app.innerHTML = pageContent.content;

    if (pageContent.scripts) {
      pageContent.scripts.map((script) => script());
    }
  }
};

window.addEventListener("hashchange", render);
window.addEventListener("load", render);
