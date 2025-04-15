import { HeaderAirplane } from "./header-airplane";

export const Header = () => {
  return (
    <header className="relative w-full bg-white border-b border-gray-200 px-4 py-3">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">Pack Together</h1>
          <HeaderAirplane />
        </div>
        {/* Add any other header content here */}
      </div>
    </header>
  );
}; 