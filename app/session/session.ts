const KEY = "chat_session_id"

export function getSessionId() : string {
    let sessionId = sessionStorage.getItem(KEY);

    if(!sessionId){
        sessionId = crypto.randomUUID();
        sessionStorage.setItem(KEY,sessionId);
    }

    return sessionId;
}