import { createBrowserRouter } from "react-router";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { Welcome } from "./screens/welcome";
import { Login } from "./screens/login";
import { Onboarding } from "./screens/onboarding";
import { Home } from "./screens/home";
import { ManualEntry } from "./screens/manual-entry";
import { ProductResult } from "./screens/product-result-new";
import { WatchlistHistory } from "./screens/watchlist-history-new";
import { Settings } from "./screens/settings-new";
import { Loading } from "./screens/loading";
import { SearchScreen } from "./screens/search";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Welcome,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    Component: ProtectedRoute,
    children: [
      {
        path: "/onboarding",
        Component: Onboarding,
      },
      {
        path: "/home",
        Component: Home,
      },
      {
        path: "/search",
        Component: SearchScreen,
      },
      {
        path: "/manual-entry",
        Component: ManualEntry,
      },
      {
        path: "/loading",
        Component: Loading,
      },
      {
        path: "/product/:id",
        Component: ProductResult,
      },
      {
        path: "/watchlist",
        Component: WatchlistHistory,
      },
      {
        path: "/settings",
        Component: Settings,
      },
    ],
  },
]);
