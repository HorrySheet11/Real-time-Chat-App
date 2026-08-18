import { useContext, useEffect, useState } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import { ChatContext } from "./context/ChatContext";
import ChatPage from "./pages/ChatPage";
import api from "./services/axios";

function App() {
	const { user, setUser, authMode, setAuthMode } = useContext(ChatContext);
	const [backendAwake, setBackendAwake] = useState(false);
	const [checkingBackend, setCheckingBackend] = useState(false);

	const handleAuthSuccess = (userData) => {
		console.log("User authenticated:", userData);
		setUser(userData);
		setAuthMode("login");
	};

	// Check backend health when entering login/register mode
	useEffect(() => {
		if (authMode === "login" || authMode === "register") {
			const checkBackend = async () => {
				setCheckingBackend(true);
				try {
					const response = await api.get("/api/health");
					if (response.status === 200 && response.data.status === "ok") {
						setBackendAwake(true);
					} else {
						setBackendAwake(false);
					}
				} catch (error) {
					console.error("Backend health check failed:", error);
					setBackendAwake(false);
				} finally {
					setCheckingBackend(false);
				}
			};

			checkBackend();
		} else {
			// Reset backend state when not in login/register mode
			setBackendAwake(false);
			setCheckingBackend(false);
		}
	}, [authMode]);

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
								className={`flex-1 rounded px-4 py-2 bg-${authMode === "register" ? "green-500" : "gray-200"} text-white rounded-t-r ${authMode === "register" ? "font-bold" : ""}`}
							>
								Register
							</button>
						</div>
						{!backendAwake && checkingBackend ? (
							<div className="text-center py-4">
								<div className="animate-spin rounded-full h-6 w-6 mx-auto border-b-2 border-blue-500 mb-2"></div>
								<p className="text-gray-500">
									Waiting for backend to wake up...
								</p>
							</div>
						) : !backendAwake && !checkingBackend ? (
							<div className="text-center py-4">
								<p className="text-red-500">
									Backend is not responding. Please try again later.
								</p>
								<button
									type="button"
									onClick={() => {
										// Trigger a recheck by toggling authMode
										const tempMode =
											authMode === "login" ? "register" : "login";
										setAuthMode(tempMode);
										setTimeout(() => setAuthMode(authMode), 100);
									}}
									className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
								>
									Retry Connection
								</button>
							</div>
						) : (
							<>
								{authMode === "login" ? (
									<Login onAuthSuccess={handleAuthSuccess} />
								) : (
									<Register onAuthSuccess={handleAuthSuccess} />
								)}
							</>
						)}
					</div>
				</div>
			)}
		</div>
	);
}

export default App;
