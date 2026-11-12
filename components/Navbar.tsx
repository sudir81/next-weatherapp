import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-white text-lg font-semibold">Weather App</div>
        <div className="flex space-x-4">
          <Link href="/" className="text-gray-300 hover:text-white">
            Home
          </Link>
          <Link href="/forecast" className="text-gray-300 hover:text-white">
            Forecast
          </Link>
          <Link href="/details" className="text-gray-300 hover:text-white">
            Details
          </Link>
        </div>
      </div>
    </nav>
  );
}
