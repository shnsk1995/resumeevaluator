"use client";

import { abort } from "process";
import React, { useEffect, useReducer, useState,useRef } from "react";
import Markdown from "react-markdown";
import { getSessionId } from "./session/session";


const API_BASE_URL = "http://localhost:8000";

async function* Backend(history : Message[], signal?:AbortSignal){

  const graphRequest = {
    history : history,
    session_id : getSessionId()
  }

  const  response = await fetch(`${API_BASE_URL}/chat`,{
    method : "POST",
    headers : {
      "content-type" : "application/json",
    },
    body : JSON.stringify(graphRequest)
  });

  const assistantMessage = await response.json();
  const messageParts = assistantMessage.split(/(\s)/);
  for(const msgPart of messageParts){
    if(signal?.aborted) throw new DOMException("Aborted","Abort Error");
    await new Promise(r => setTimeout(r,35));
    yield msgPart;
  }

}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status: "Thinking..." | "Streaming..." | "Done" | "Message Aborted"
};

type ActMsgStatus ={
  id: string;
  status: "None" | "Streaming" | "Finished";
};

type State = {
  messages: Message[];
  lastActiveMessage : ActMsgStatus;
};

type Action =
  | { type: "ADD_MESSAGES"; payload: Message[] }
  | { type: "ADD_MESSAGE"; payload: Message }
  | {type : "UPDATE_MESSAGE"; payload : Message }
  | {type : "SET_LAST_MESSAGE_STATUS"; payload : ActMsgStatus };

const initialState: State = {
    messages: [],
    lastActiveMessage : {id : "", status : "None"}
  };

function uuid(){
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

function reducer(state: State, action: Action) : State{
  switch(action.type){
    case "ADD_MESSAGES":
      return { ...state, messages: [...state.messages, ...action.payload]}
    case "UPDATE_MESSAGE":
      return { ...state, messages: state.messages.map(m =>(
        m.id == action.payload.id ? action.payload : m
      ))}
    case "SET_LAST_MESSAGE_STATUS":
      return {...state, lastActiveMessage : action.payload}
    default:
      return state
  }

}

const MessageBox = React.memo(function MessageBox({msg} : {msg : Message}){

  const messageType : boolean = msg.role==="user";
  return (<div className={` max-w-xs md:max-w-2xl border p-2 rounded-lg shadow-xl text-justify ${messageType ? "self-end border-blue-500 bg-blue-100 ml-auto text-blue-900" : "self-start border-gray-500 bg-gray-100 mr-auto text-gray-900"} whitespace-pre-wrap break-words overflow-wrap-anywhere`}>
      <p className={`rounded-lg mb-4 ${ msg.status==="Message Aborted" ? "text-red-900" : "text-slate-500"}`}>{messageType ? "User" : "Assistant"} {"  "} {messageType ? "":msg.status==="Done" ? "": msg.status}</p>
      <Markdown>{msg.content}</Markdown>
  </div>);

});


export default function Home() {

  const [state,dispatch] = useReducer(reducer,initialState)
  const [text,setText] = useState("")
  const [roles,setRoles] = useState("")
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const messages : Message[] = state.messages;
  const bufferRef = useRef("");
  const flushTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const isStreaming : boolean = state.lastActiveMessage.status==="Streaming";

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

  async function RunStream(history : Message[], asstMsgId : string) {

    const controller = new AbortController();
    abortRef.current = controller;
    
    bufferRef.current = "";

    dispatch({
      type : "SET_LAST_MESSAGE_STATUS",
      payload : {id : asstMsgId, status : "Streaming"}
    })

    dispatch({
      type : "UPDATE_MESSAGE",
      payload : {id : asstMsgId, role : "assistant", content: "", status : "T..."}
    })

    StartFlusher(asstMsgId);

    for await(const token of Backend(history, controller.signal)){
      bufferRef.current+=token;
    }

  

    dispatch({
      type : "UPDATE_MESSAGE",
      payload : {id : asstMsgId, role : "assistant", content: bufferRef.current, status : "Done"}
    })

    dispatch({
      type : "SET_LAST_MESSAGE_STATUS",
      payload : {id : asstMsgId, status : "Finished"}
    })



    StopFlusher();


  }


  async function newUserMessage(msg:string){

    const userMsgId : string = uuid();
    const assistantMsgId : string = uuid();

    const userMessage : Message  = {
      id: userMsgId,
      role : "user" as const,
      content: msg,
      status : "Done"
    }

    const assistantMessage : Message = {
      id : assistantMsgId,
      role : "assistant" as const,
      content: "",
      status: "Thinking..."
    }



    dispatch({
      type : "ADD_MESSAGES",
      payload : [userMessage,assistantMessage]
    });

    const history = [...state.messages, userMessage]

    await RunStream(history, assistantMsgId);

  }

  function StopStreaming(){

    abortRef.current?.abort()
    const controller = new AbortController();
    abortRef.current = controller;


    dispatch({
      type : "UPDATE_MESSAGE",
      payload : {id : state.lastActiveMessage.id, role : "assistant", content: bufferRef.current, status : "Message Aborted"}
    })

    dispatch({
      type : "SET_LAST_MESSAGE_STATUS",
      payload : {id : state.lastActiveMessage.id, status : "Finished"}
    })

    StopFlusher();


  }

  function OnSubmit(e : any){
    e.preventDefault();
    const userMessage = "Resume: \n" + text.trim() + "\n\n\nTargeting roles: \n" + roles.trim();
    if(!userMessage) return;
    if ( state.lastActiveMessage.status=="Finished" ||  state.lastActiveMessage.status=="None"){

      setText(""); 
      setRoles("");
      newUserMessage(userMessage);

    }
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
          <button className="border p-2 rounded-xl border-gray-500 shadow-l hover:bg-pink-500 hover:text-white text-pink-900" type="button" disabled={!isStreaming} onClick={StopStreaming}>
            Stop
          </button>


        </form>
        
        </div>
      </div>
    </div>
  );
}
