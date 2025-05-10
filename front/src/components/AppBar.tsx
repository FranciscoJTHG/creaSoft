import Link from "next/link";

export default function AppTopBar() {
  return (
    <nav className="absolute w-full top-0 bg-gray-900 h-14 text-white font-bold text-2xl justify-items-center">
      <Link className="flex flex-row items-center h-full gap-2" href={"/"}>
        <img
          className="h-8"
          style={{ aspectRatio: 1 }}
          src={"/app-icon.png"}
          alt="App icon"
        />
        <span>CineMind</span>
      </Link>
    </nav>
  );
}
