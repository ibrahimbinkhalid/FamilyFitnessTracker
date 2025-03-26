import { Link } from "wouter";

export default function Header() {
  return (
    <header className="bg-primary text-white p-4 flex justify-between items-center">
      <div className="flex items-center">
        <Link href="/">
          <h1 className="text-xl font-bold cursor-pointer">FamFit</h1>
        </Link>
        <span className="ml-2 text-xs bg-white bg-opacity-20 px-2 py-1 rounded-full">Family Edition</span>
      </div>
      <div className="flex items-center space-x-2">
        <span className="material-icons text-xl cursor-pointer">notifications</span>
        <div className="w-8 h-8 rounded-full bg-white bg-opacity-30 flex items-center justify-center cursor-pointer">
          <span className="material-icons text-sm">person</span>
        </div>
      </div>
    </header>
  );
}
