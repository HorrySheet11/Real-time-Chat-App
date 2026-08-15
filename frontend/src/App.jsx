import { useContext, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { ChatContext } from "./context/ChatContext";
import ChatPage from "./pages/ChatPage";

function App() {
	const { user, setUser, authMode, setAuthMode } = useContext(ChatContext);

	const handleAuthSuccess = (userData) => {
    console.log("User authenticated:", userData);
		setUser(userData);
		setAuthMode("login");
	};

	useEffect(() => {
		console.log(user);
	}, [user]);

	return (
		<div>
			{user ? (
				<ChatPage />
			) : (
				<div className="flex flex-col items-center justify-center min-h-screen bg-darkBg">
					<div className="bg-darkBg p-8 rounded-lg shadow-md w-full max-w-md">
						<h1 className="text-2xl font-bold mb-6 text-center">Horry Chat!</h1>
						<div className="flex mb-4">
							<button
								type="button"
								onClick={() => setAuthMode("login")}
								className={`flex-1 rounded px-4 py-2 bg-${authMode === "login" ? "blue-500" : "gray-200"} text-white rounded-t-l ${authMode === "login" ? "font-bold" : ""}`}
							>
								Login
							</button>
							<button
								type="button"
								onClick={() => setAuthMode("register")}
								className={`flex-1 rounded px-4 py-2 bg-${authMode === "register" ? "blue-500" : "gray-200"} text-white rounded-t-r ${authMode === "register" ? "font-bold" : ""}`}
							>
								Register
							</button>
						</div>
						{authMode === "login" ? (
							<Login onAuthSuccess={handleAuthSuccess} />
						) : (
							<Register onAuthSuccess={handleAuthSuccess} />
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
