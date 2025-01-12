import Image from "next/image";
import { History } from "@/components/custom/history";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="VTX"
              width={32}
              height={32}
              className="rounded-full"
            />
            <span className="font-medium">VTX</span>
          </div>
          <div className="flex items-center">
            <History />
          </div>
        </div>
      </div>
    </header>
  );
}
