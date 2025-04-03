import { useChat } from "../hooks/useChat";
import { VoiceRecorder } from "./VoiceRecorder";
import { UserProfileDrawer } from "./UserProfileDrawer";
import { EndChatButton } from "./EndChatButton";

export const UI = ({ hidden, jsonFilePath = "./chat_data.json", ...props }) => {
  const { chat, loading, cameraZoomed, setCameraZoomed, message } = useChat();

  if (hidden) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-10 flex justify-between p-4 flex-col pointer-events-none">
      <div className="w-full flex justify-between items-start">
        <div className="backdrop-blur-md bg-white bg-opacity-50 p-4 rounded-lg">
          <h1 className="font-black text-xl">Your virtual helper</h1>
          <p>I will always help you</p>
        </div>
        
        {/* User Profile Button and Drawer */}
        <div className="pointer-events-auto">
          <UserProfileDrawer />
        </div>
      </div>

      {/* Middle section with zoom button on right and end chat button on left */}
      <div className="w-full flex justify-between items-center">
        {/* End Chat Button - Middle Left */}
        <div className="pointer-events-auto">
          <EndChatButton 
            jsonFilePath={jsonFilePath} 
            onEndChat={() => console.log('Chat ended')} 
          />
        </div>
        
        {/* Zoom button - Middle Right (original position) */}
        <div className="pointer-events-auto">
          <button
            onClick={() => setCameraZoomed(!cameraZoomed)}
            className="bg-pink-500 hover:bg-pink-600 text-white p-4 rounded-md"
          >
            {cameraZoomed ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="pointer-events-auto w-full flex justify-center">
        <VoiceRecorder
          disabled={loading || message}
          onTranscriptionComplete={(data) => {
            if (data.messages) {
              chat(data.messages);
            }
          }}
        />
      </div>
    </div>
  );
};