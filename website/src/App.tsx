import { Route, Routes } from "react-router-dom";

import { SidebarLayout } from "@/layouts/sidebar";
import { DashboardPage } from "@/pages/dashboard";
import { DevicePage } from "@/pages/device";
import { DevicesPage } from "@/pages/devices";

function App() {
	return (
		<Routes>
			<Route path="/" element={<SidebarLayout />}>
				<Route index path="/" element={<DashboardPage />} />
				<Route path="/devices" element={<DevicesPage />} />
				<Route path="/devices/:deviceId" element={<DevicePage />} />
			</Route>
		</Routes>
	);
}

export default App;
