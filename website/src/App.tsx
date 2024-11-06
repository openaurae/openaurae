import { Route, Routes } from "react-router-dom";

import { SidebarLayout } from "@/layouts/sidebar";
import { DashboardPage } from "@/pages/dashboard";
import { DevicesPage } from "@/pages/devices";

function App() {
	return (
		<Routes>
			<Route path="/" element={<SidebarLayout />}>
				<Route index path="/" element={<DashboardPage />} />
				<Route path="/devices/:deviceType" element={<DevicesPage />} />
			</Route>
		</Routes>
	);
}

export default App;
