import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Players from "./pages/Players";
import PlayerDetail from "./pages/PlayerDetail";
import Heroes from "./pages/Heroes";
import HeroDetail from "./pages/HeroDetail";
import Matches from "./pages/Matches";
import MatchDetail from "./pages/MatchDetail";
import Login from "./pages/Login";
import { AuthGuard } from "./components/AuthGuard";
import { useAuth } from "./_core/hooks/useAuth";

function Router() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!user) {
    return (
      <Switch>
        <Route path={"/login"} component={Login} />
        <Route path={"/"} component={Login} />
        <Route component={Login} />
      </Switch>
    );
  }

  return (
    <AuthGuard>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/players"} component={Players} />
        <Route path={"/players/:id"} component={PlayerDetail} />
        <Route path={"/heroes/:id"} component={HeroDetail} />
        <Route path={"/heroes"} component={Heroes} />
        <Route path={"/matches/:id"} component={MatchDetail} />
        <Route path={"/matches"} component={Matches} />

        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </AuthGuard>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
