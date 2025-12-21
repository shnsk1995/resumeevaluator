import Image from "next/image";

export default function Home() {
   return (
    <div className="p-5 border bg-red-500 min-h-screen rounded">
      {/* Page */}
      <div className="mx-auto border border-orange-500 rounded  p-2 border-10 bg-yellow-100 h-[95dvh]">
        
        {/* Header */}
        <div className="border border-green-500 border-5 p-2 rounded text-center">
          Resume Evaluator
        </div>

        {/* Messages */}
        <div className="border border-green-500 border-5 p-2 mt-2 space-y-2 h-[78dvh]">
          <div className="border p-2 rounded w-3xl ml-auto">
            Hello!
          </div>
          <div className="border p-2 rounded w-3xl mr-auto">
            Hi there!
          </div>
        </div>

        {/* Input */}
        <div className="flex gap-2 border border-dashed p-2 mt-2">
          <input
            className="flex-1 border p-2 rounded"
            placeholder="Type message..."
          />
          <button className="border px-4 rounded">
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
