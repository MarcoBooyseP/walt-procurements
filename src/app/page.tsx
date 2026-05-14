import { RequestForm } from "@/components/request-form";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center">
      <div className="w-full max-w-lg mx-auto bg-white min-h-screen shadow-2xl sm:min-h-0 sm:mt-10 sm:rounded-[32px] sm:overflow-hidden flex flex-col">
        
        {/* Header */}
        <header className="bg-brand-red text-white px-6 py-8 sm:px-8 text-center rounded-b-3xl sm:rounded-none sm:rounded-t-[32px] shadow-md z-10 relative">
          <img 
            src="/images/walt_logo_white.png" 
            alt="Walt Landgoed Logo" 
            className="h-14 mx-auto object-contain relative z-10 mb-3"
          />
          <p className="text-white/90 font-medium text-[17px] relative z-10">Field Supply Request</p>
        </header>

        {/* Form Container */}
        <div className="flex-1 px-5 py-8 sm:p-8 bg-gray-50/50">
          <RequestForm />
        </div>
        
      </div>
    </main>
  );
}
