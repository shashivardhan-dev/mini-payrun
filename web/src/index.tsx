import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import  App  from './App';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
const queryClient = new QueryClient();

let container = document.getElementById("app")!;
let root = createRoot(container)
root.render(
  <StrictMode>
      <QueryClientProvider client={queryClient}>
    <App />
    </QueryClientProvider>
  </StrictMode>
);