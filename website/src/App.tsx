import { Route, Routes } from "react-router-dom";

import { DashboardPage } from "@/pages/dashboard";

function App() {
	return (
		<Routes>
			<Route index path="/" element={<DashboardPage />} />
		</Routes>
	);
}

export default App;
