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
		// console.log("User authenticated:", userData);
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
				<div className="flex flex-col items-center justify-center min-h-screen bg-darkBg px-4 2xs:px-2 xs:px-4 sm:px-6 md:px-8">
					<div className="bg-darkBg p-4 2xs:p-2 xs:p-4 sm:p-6 md:p-8 rounded-lg shadow-md w-full max-w-xs 2xs:max-w-[90vw] xs:max-w-sm sm:max-w-md md:max-w-lg">
						<h1 className="text-xl 2xs:text-lg xs:text-xl sm:text-2xl md:text-3xl font-bold mb-4 2xs:mb-2 xs:mb-3 sm:mb-4 md:mb-6 text-center">Horry Chat!</h1>
						<div className="flex mb-2 2xs:mb-1 xs:mb-1.5 sm:mb-2">
							<button
								type="button"
								onClick={() => setAuthMode("login")}
								className={`flex-1 rounded px-2 2xs:px-1 xs:px-1.5 sm:px-2 py-1.5 2xs:py-0.5 xs:py-1 sm:py-1.5 bg-${authMode === "login" ? "blue-500" : "gray-200"} text-white rounded-t-l ${authMode === "login" ? "font-medium" : ""}`}
							>
								Login
							</button>
							<button
								type="button"
								onClick={() => setAuthMode("register")}
								className={`flex-1 rounded px-2 2xs:px-1 xs:px-1.5 sm:px-2 py-1.5 2xs:py-0.5 xs:py-1 sm:py-1.5 bg-${authMode === "register" ? "green-500" : "gray-200"} text-white rounded-t-r ${authMode === "register" ? "font-medium" : ""}`}
							>
								Register
							</button>
						</div>
						{!backendAwake && checkingBackend ? (
							<div className="text-center py-3 2xs:py-2 xs:py-3 sm:py-4">
								<div className="animate-spin rounded-full h-5 2xs:h-4 xs:h-5 sm:h-6 w-5 2xs:w-4 xs:w-5 sm:w-6 mx-auto border-b-2 border-blue-500 mb-2 2xs:mb-1 xs:mb-2 sm:mb-3"></div>
								<p className="text-sm 2xs:text-xs xs:text-sm sm:text-base text-gray-500">
									Waiting for backend to wake up...
								</p>
							</div>
						) : !backendAwake && !checkingBackend ? (
							<div className="text-center py-3 2xs:py-2 xs:py-3 sm:py-4">
								<p className="text-sm 2xs:text-xs xs:text-sm sm:text-base text-red-500">
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
									className="bg-blue-500 hover:bg-blue-600 text-white py-2 2xs:py-1 xs:py-2 sm:py-3 px-3 2xs:px-2 xs:px-3 sm:px-4 rounded"
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