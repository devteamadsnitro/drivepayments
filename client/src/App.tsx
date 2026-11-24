import { lazy, Suspense } from "react";
import Apply from "@/pages/Apply";
import NotFound from "@/pages/NotFound";
import Privacy from "@/pages/Privacy";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { tr, useLang } from "./lib/i18n";

// El CRM es una herramienta interna: se carga aparte para no engordar el
// formulario público.
const Admin = lazy(() => import("@/pages/Admin"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Apply} />
      <Route path="/privacidad" component={Privacy} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/admin">
        <Suspense
          fallback={
            <div className="flex min-h-screen items-center justify-center bg-paper text-[13px] text-ink-muted">
              {tr("Cargando…", "Loading…")}
            </div>
          }
        >
          <Admin />
        </Suspense>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Suscripción raíz: al cambiar de idioma se vuelve a renderizar todo el árbol
  // (sin desmontarlo, así el formulario conserva lo que ya se ha rellenado).
  useLang();
  return (
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  );
}

export default App;
