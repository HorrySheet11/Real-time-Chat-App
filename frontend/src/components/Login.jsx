import { useContext, useState } from "react";
import { ChatContext } from "../context/ChatContext";
import api from "../services/axios";

export default function Login({ onAuthSuccess }) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [loading, setLoading] = useState(false);

	const { setAuthMode } = useContext(ChatContext);

	const handleSubmit = async (e) => {
		// e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await api.post(
				"/api/login",
				{
					username,
					password,
				},
				{
					headers: {
						"Content-Type": "application/json",
					},
					withCredentials: true,
					AccessControlAllowCredentials: true,
				},
			);

			const data = await response.data;
			if (!response.ok) {
				throw new Error(data.message || "Login failed");
			}

			// Assuming the response includes { message, user: { _id, username } }
			onAuthSuccess(data.user);
		} catch (err) {
			setError(err.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			<h2 className="text-xl font-bold">Login</h2>
			{error && <p className="text-red-500">{error}</p>}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-sm font-medium mb-1">
						Username{" "}
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</label>
				</div>
				<div>
					<label className="block text-sm font-medium mb-1">
						Password{" "}
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</label>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md disabled:opacity-50"
				>
					{loading ? "Logging in..." : "Login"}
				</button>
			</form>
			<p className="text-center text-sm">
				Don't have an account?{" "}
				{/** biome-ignore lint/a11y/noStaticElementInteractions: link to register */}
				{/** biome-ignore lint/a11y/useKeyWithClickEvents: link to register */}
				<span
					className="text-blue-500 cursor-pointer"
					onClick={() => setAuthMode("register")}
				>
					Register
				</span>
			</p>
		</div>
	);
}
