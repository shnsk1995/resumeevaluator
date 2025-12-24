"use client";
import React, { useEffect, useReducer, useState,useRef } from "react";
import Markdown from "react-markdown";



async function* FakeBackend(userMessage : string){

  const  assistantMessage : string = "I will **assume** that you are having some coding knowledge about JavaScript and have installed Node on your system for creating a below given React Hook program. An installation of Node comes along with the command-line tools: npm and npx, where npm is useful to install the packages into a project and npx is useful in running commands of Node from the command line. The npx looks in the current project folder for checking whether a command has been installed there. When the command is not available on your computer, the npx will look in the npmjs.com repository, then the latest version of the command script will be loaded and will run without locally installing it. This feature is useful in creating a skeleton React application within a few key presses."
  const messageParts = assistantMessage.split(/(\s)/);
  for(const msgPart of messageParts){
    await new Promise(r => setTimeout(r,35));
    yield msgPart;
  }

}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "Thinking..." | "Streaming..." | "Done"
};

type State = {
  messages: Message[];
};

type Action =
  | { type: "ADD_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | {type : "UPDATE_MESSAGE"; payload : Message };

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
    case "UPDATE_MESSAGE":
      return { ...state, messages: state.messages.map(m =>(
        m.id == action.payload.id ? action.payload : m
      ))}
    default:
      return state
  }

}

function UserMessage({msg} : {msg : string}){
  return(
  <div className="self-end max-w-xs md:max-w-2xl border border-blue-500 p-2 rounded-lg bg-blue-100 ml-auto text-blue-900">
    <p className="rounded-lg mb-4 text-slate-400">User</p>
    <Markdown>{msg}</Markdown>
  </div>);
}

const MessageBox = React.memo(function MessageBox({msg} : {msg : Message}){

  const messageType : boolean = msg.role==="user";
  return (<div className={` max-w-xs md:max-w-2xl border p-2 rounded-lg shadow-xl text-justify ${messageType ? "self-end border-blue-500 bg-blue-100 ml-auto text-blue-900" : "self-start border-gray-500 bg-gray-100 mr-auto text-gray-900"}`}>
      <p className="rounded-lg mb-4 text-slate-500">{messageType ? "User" : "Assistant"} {"  "} {messageType ? "":msg.status==="Done" ? "": msg.status}</p>
      <Markdown>{msg.content}</Markdown>
  </div>);

});

function AssistantMessage({msg} : {msg : string}){
  return(
    <div className="self-start max-w-xs md:max-w-2xl border border-gray-500 bg-gray-100 p-2 rounded-lg mr-auto text-gray-900 text-justify">
      <p className="rounded-lg mb-4 text-slate-400">Assistant</p>
      <Markdown>{msg}</Markdown>
  </div>);
}



export default function Home() {

  const [state,dispatch] = useReducer(reducer,initialState)
  const [text,setText] = useState("")
  const [roles,setRoles] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messages : Message[] = state.messages;
  const bufferRef = useRef("");
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);

  function StartFlusher(asstMsgId : string){
    flushTimerRef.current = setInterval(() => {
      dispatch({
        type : "UPDATE_MESSAGE",
        payload : {id : asstMsgId, role : "assistant" , content : bufferRef.current, status:"Streaming..."}
      })
    },60);
  }

  function StopFlusher(){
    if(flushTimerRef.current) clearInterval(flushTimerRef.current);
    flushTimerRef.current = null;
  }

  async function RunStream(userMessage : string, asstMsgId : string) {
    
    bufferRef.current = "";

    dispatch({
      type : "UPDATE_MESSAGE",
      payload : {id : asstMsgId, role : "assistant", content: "", status : "Streaming..."}
    })

    StartFlusher(asstMsgId);

    for await(const token of FakeBackend(userMessage)){
      bufferRef.current+=token;
    }

    dispatch({
      type : "UPDATE_MESSAGE",
      payload : {id : asstMsgId, role : "assistant", content: bufferRef.current, status : "Done"}
    })

    StopFlusher();


  }


  async function newUserMessage(userMessage:string){

    const userMsgId : string = uuid();
    const assistantMsgId : string = uuid();

    console.log(userMsgId);
    console.log(assistantMsgId)

    dispatch({

      type : "ADD_MESSAGES",
      payload : [{
        id: userMsgId,
        role : "user",
        content: userMessage,
        status : "Done"
      },{
        id : assistantMsgId,
        role : "assistant",
        content: "",
        status: "Thinking..."
      }]
    });

    await RunStream(userMessage, assistantMsgId);

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
      <div className="flex  flex-col mx-auto border border-pink-500 rounded-3xl  p-2 bg-yellow-100 min-h-[100dvh] h-[100dvh] shadow-xl shadow-pink-500/50 ">
        
        {/* Header */}
        <div className=" flex-none items-center justify-center border border-green-500 p-2 rounded-xl text-center shadow-lg shadow-green-500/50 mt-2 bg-orange-200 text-pink-900 text-2xl font-bold">
          Resume Evaluator
        </div>

        {/* Messages. overflow-y-auto only works if parent height is constrained. */}
        <div className=" flex-1 border border-green-500 bg-amber-100 p-2 mt-2 space-y-2 shadow-lg shadow-green-500/50 rounded-xl overflow-y-auto min-h-0">
          
        {messages.map((m) => (
          <MessageBox key={m.id} msg={m} />
        ))}
          
          
        <div ref={bottomRef}/>
        </div>

        {/* Input */}
        <div className="flex-none items-center justify-center gap-2 border border-green-500 shadow-lg shadow-green-500/50 rounded-xl p-2 mt-2 items-center">
        <form className="gap-4 flex items-center justify-center flex-col md:flex-row w-full md:w-auto" onSubmit={OnSubmit}>

        <input
            className=" w-full md:flex-1 border p-2 rounded-xl border-gray-500 shadow-lg text-pink-900"
            placeholder="Paste your resume..."
            value={text}
            onChange={(e)=> setText(e.target.value)}
          />
          <input
            className="w-full md:flex-1 border p-2 rounded-xl border-gray-500 shadow-lg text-pink-900"
            placeholder="Targeting roles...."
            value={roles}
            onChange={(e)=> setRoles(e.target.value)}
          />
          <button className="border p-2 rounded-xl border-gray-500 shadow-l hover:bg-pink-500 hover:text-white text-pink-900" type="submit">
            Send
          </button>


        </form>
        
        </div>
      </div>
    </div>
  );
}
