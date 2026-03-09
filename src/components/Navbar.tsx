"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-plenful-gray-200">
      <div className="max-w-[1400px] mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-plenful-dark rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-semibold tracking-tight text-plenful-dark">
            plenful
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-1">
          <Link
            href="/queue"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === "/queue"
                ? "bg-plenful-teal-light text-plenful-teal-dark"
                : "text-plenful-gray-600 hover:bg-plenful-gray-50 hover:text-plenful-gray-800"
            }`}
          >
            Review Queue
          </Link>
          <Link
            href="/review"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              pathname === "/review"
                ? "bg-plenful-teal-light text-plenful-teal-dark"
                : "text-plenful-gray-600 hover:bg-plenful-gray-50 hover:text-plenful-gray-800"
            }`}
          >
            Evidence Review
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-plenful-gray-500">340B Referral Capture</span>
          <div className="w-8 h-8 rounded-full bg-plenful-teal flex items-center justify-center text-white text-sm font-medium">
            AS
          </div>
        </div>
      </div>
    </nav>
  );
}
