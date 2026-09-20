type Route = (params: Record<string, string>) => void;

/**
 * A very small history-API router. It exists so the app has a real URL like
 * /notes/<id>, which is what makes the nginx `try_files` problem show up when
 * a student refreshes that page inside a container.
 */
export function createRouter(routes: Record<string, Route>, notFound: Route) {
  function resolve(path: string) {
    for (const [pattern, handler] of Object.entries(routes)) {
      const names: string[] = [];
      const regex = new RegExp(
        '^' +
          pattern.replace(/:[a-zA-Z]+/g, (m) => {
            names.push(m.slice(1));
            return '([^/]+)';
          }) +
          '$'
      );
      const match = path.match(regex);
      if (match) {
        const params: Record<string, string> = {};
        names.forEach((n, i) => (params[n] = decodeURIComponent(match[i + 1])));
        return () => handler(params);
      }
    }
    return () => notFound({});
  }

  function render() {
    resolve(window.location.pathname)();
  }

  function navigate(path: string) {
    history.pushState({}, '', path);
    render();
  }

  window.addEventListener('popstate', render);
  return { render, navigate };
}
