import { Providers } from "./providers";
import { HomeView } from "@/components/HomeView";

export default function Page() {
  return (
    <Providers>
      <HomeView />
    </Providers>
  );
}
