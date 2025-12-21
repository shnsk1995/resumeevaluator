import Image from "next/image";

export default function Home() {
   return (
    <div className="p-5 border bg-yellow-500 min-h-screen rounded-3xl shadow-lg">
      {/* Page */}
      <div className="mx-auto border border-pink-500 rounded-3xl  p-2 border-10 bg-yellow-100 h-[95dvh] shadow-xl shadow-pink-500/50 ">
        
        {/* Header */}
        <div className="border border-green-500 border-5 p-2 rounded-xl text-center shadow-lg shadow-green-500/50 mt-2 bg-red-200">
          Resume Evaluator
        </div>

        {/* Messages */}
        <div className="border border-green-500 border-5 bg-amber-100 p-2 mt-2 space-y-2 h-[70dvh] lg:h-[70dvh] shadow-lg shadow-green-500/50 rounded-xl">
          <div className="border border-blue-500 border-3 p-2 rounded-lg bg-blue-100 ml-auto">
            Hello!
          </div>
          <div className="border border-gray-500 border-3 bg-gray-100 p-2 rounded-lg mr-auto">
            Hi there!
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 border border-green-500 border-5 shadow-lg shadow-green-500/50 rounded-xl p-2 mt-2">
          <input
            className="flex-1 border p-2 rounded-xl border-gray-500 border-2 shadow-lg text-pink-900"
            placeholder="Type message..."
          />
          <button className="border px-4 rounded-xl border-gray-500 border-2 shadow-lg hover:bg-pink-500 hover:text-white">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
