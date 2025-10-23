import Link from "next/link";
import Image from "next/image";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Section - Marketing */}
      <div className="hidden lg:flex lg:w-2/3 bg-white flex-col justify-center items-center px-12">
        <div className="max-w-lg">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Automate Your Tasks With Saku AI
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Automate your ideas into reality fast & quick!
          </p>
          
          {/* Browser Illustration */}
          <div className="relative">
            <div className="bg-gray-100 rounded-lg p-4 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-pink-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-pink-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex items-center mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <div className="w-6 h-6 bg-blue-300 rounded-full"></div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
              
              {/* Integration Cards */}
              <div className="flex justify-end space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600">*</span>
                </div>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600">📁</span>
                </div>
              </div>
              
              {/* User Stats */}
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="flex items-center mb-2">
                  <span className="text-gray-600 mr-2">👥</span>
                  <span className="text-sm text-gray-600">Member • 16</span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  48/57 Integrations • 3 Features
                </div>
                <div className="flex space-x-1">
                  <div className="w-6 h-6 bg-pink-200 rounded-full"></div>
                  <div className="w-6 h-6 bg-blue-200 rounded-full"></div>
                  <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="w-full lg:w-1/3 bg-muted flex min-h-screen flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <Image src="/logos/logo.svg" alt="Saku AI Logo" width={30} height={30} />
            Saku AI
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;