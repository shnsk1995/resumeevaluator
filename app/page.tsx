"use client";
import Image from "next/image";
import { useEffect, useReducer, useState,useRef } from "react";


type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type State = {
  messages: Message[];
};

type Action =
  | { type: "ADD_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message };

const initialState: State = {
    messages: []
  };

function uuid(){
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reducer(state: State, action: Action) : State{
  switch(action.type){
    case "ADD_MESSAGES":
      console.log("Happy!")
      return { ...state, messages: [...state.messages, ...action.payload]}
  }

  return state;

}

function UserMessage({msg} : {msg : string}){
  return(
  <div className="self-end max-w-xs md:max-w-2xl border border-blue-500 border-3 p-2 rounded-lg bg-blue-100 ml-auto text-blue-900">
    <p className="rounded-lg mb-4 text-black underline">User</p>
    {msg}
  </div>);
}

function AssistantMessage({msg} : {msg : string}){
  return(
    <div className="self-start max-w-xs md:max-w-2xl border border-gray-500 border-3 bg-gray-100 p-2 rounded-lg mr-auto text-gray-900">
      <p className="rounded-lg mb-4 text-black underline">Assistant</p>
      {msg}
  </div>);
}



export default function Home() {

  const [state,dispatch] = useReducer(reducer,initialState)
  const [text,setText] = useState("")
  const [roles,setRoles] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null);


  function newUserMessage(userMessage:string){

    const userMsgId = uuid();
    const assistantMsgId = uuid();

    console.log(userMsgId);
    console.log(assistantMsgId)

    dispatch({

      type : "ADD_MESSAGES",
      payload : [{
        id: userMsgId,
        role : "user",
        content: userMessage
      },{
        id : assistantMsgId,
        role : "assistant",
        content: "Received your message. WIll reply soon!"
      }]
    });

  }

  function OnSubmit(e : any){
    e.preventDefault();
    const userMessage = text.trim();
    if(!userMessage) return;
    setText("");
    newUserMessage(userMessage);
  }

  useEffect(() => {bottomRef.current?.scrollIntoView({behavior:"smooth"})},[state.messages.length])


   return (
    <div className="p-5 border bg-yellow-500 min-h-[100dvh] rounded-3xl shadow-lg">
      {/* Page */}
      <div className="flex  flex-col mx-auto border border-pink-500 rounded-3xl  p-2 border-10 bg-yellow-100 min-h-[100dvh] h-[100dvh] shadow-xl shadow-pink-500/50 ">
        
        {/* Header */}
        <div className=" flex-none items-center justify-center border border-green-500 border-5 p-2 rounded-xl text-center shadow-lg shadow-green-500/50 mt-2 bg-red-200 text-pink-900">
          Resume Evaluator
        </div>

        {/* Messages. overflow-y-auto only works if parent height is constrained. */}
        <div className=" flex-1 border border-green-500 border-5 bg-amber-100 p-2 mt-2 space-y-2 shadow-lg shadow-green-500/50 rounded-xl overflow-y-auto min-h-0">
          
        {state.messages.map(m => (
              m.role==="user" ? 
              <UserMessage  key={m.id} msg={m.content} /> :
              <AssistantMessage  key={m.id} msg={m.content} />
            ))
}
          
          
        <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="flex-none items-center justify-center gap-2 border border-green-500 border-5 shadow-lg shadow-green-500/50 rounded-xl p-2 mt-2 items-center">
        <form className="gap-4 flex items-center justify-center flex-col md:flex-row w-full md:w-auto" onSubmit={OnSubmit}>

        <input
            className=" w-full md:flex-1 border p-2 rounded-xl border-gray-500 border-2 shadow-lg text-pink-900"
            placeholder="Paste your resume..."
            value={text}
            onChange={(e)=> setText(e.target.value)}
          />
          <input
            className="w-full md:flex-1 border p-2 rounded-xl border-gray-500 border-2 shadow-lg text-pink-900"
            placeholder="Targeting roles...."
            value={roles}
            onChange={(e)=> setRoles(e.target.value)}
          />
          <button className="border p-2 rounded-xl border-gray-500 border-2 shadow-lg hover:bg-pink-500 hover:text-white text-pink-900" type="submit">
            Send
          </button>


        </form>
        
        </div>
      </div>
    </div>
  );
}
