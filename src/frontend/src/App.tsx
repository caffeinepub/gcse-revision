import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import HomePage from "./pages/HomePage";
import SubjectPage from "./pages/SubjectPage";

const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
      <Toaster position="bottom-right" />
    </>
  ),
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const subjectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/subject/$id",
  component: SubjectPage,
});

const routeTree = rootRoute.addChildren([homeRoute, subjectRoute]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
