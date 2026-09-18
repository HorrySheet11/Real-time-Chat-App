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
		e.preventDefault();
		setError("");
		setLoading(true);
		try {
			const response = await api.post(
				"/api/login",
				{
					username,
					password,
				},
			);

			// Assuming the response includes { message, user: { _id, username } }
			const data = response.data;
			// console.log(data);
			onAuthSuccess(data.user);
		} catch (err) {
			console.log(err);
			if (err.response && err.response.status === 401) {
				setError('Unauthorized');
			} else {
				setError(err.response?.data?.message || err.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-5 2xs:space-y-4 xs:space-y-5 sm:space-y-6">
			<h2 className="text-xl 2xs:text-lg xs:text-xl sm:text-2xl font-bold">Login</h2>
			{error && <p className="text-red-500 2xs:text-xs xs:text-sm sm:text-base">{error}</p>}
			<form onSubmit={handleSubmit} className="space-y-4 2xs:space-y-3 xs:space-y-4 sm:space-y-5">
				<div>
					<label className="block text-sm 2xs:text-xs xs:text-sm sm:text-base font-medium mb-2 2xs:mb-1 xs:mb-1 sm:mb-2">
						Username{" "}
						<input
							type="text"
							value={username}
							onChange={(e) => setUsername(e.target.value)}
							required
							className="w-full px-3 2xs:px-2 xs:px-3 sm:px-4 py-2 2xs:py-1 xs:py-2 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</label>
				</div>
				<div>
					<label className="block text-sm 2xs:text-xs xs:text-sm sm:text-base font-medium mb-2 2xs:mb-1 xs:mb-1 sm:mb-2">
						Password{" "}
						<input
							type="password"
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							required
							className="w-full px-3 2xs:px-2 xs:px-3 sm:px-4 py-2 2xs:py-1 xs:py-2 sm:py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
						/>
					</label>
				</div>
				<button
					type="submit"
					disabled={loading}
					className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 2xs:py-1 xs:py-2 sm:py-3 px-4 2xs:px-3 xs:px-4 sm:px-5 rounded-md disabled:opacity-50"
				>
					{loading ? "Logging in..." : "Login"}
				</button>
				<p className="text-center text-sm 2xs:text-xs xs:text-sm sm:text-base">
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
			</form>
		</div>
	);
}