import Sidebar from "../components/dashboard/Sidebar";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import MetricCards from "../components/dashboard/MetricCards";
import HealthTip from "../components/dashboard/HealthTip";
import BMICalculator from "../components/dashboard/BMICalculator";
import WaterTracker from "../components/dashboard/WaterTracker";
import SleepTracker from "../components/dashboard/SleepTracker";
import MoodTracker from "../components/dashboard/MoodTracker";
import Appointments from "../components/dashboard/Appointments";
import Reminders from "../components/dashboard/Reminders";

function Dashboard() {
  return (
    <div className="dashboard">
      <Sidebar />

      <main className="dashboard-main">
        <DashboardHeader />

        <MetricCards />

        <HealthTip />

        <div className="trackers-grid">
          <BMICalculator />
          <WaterTracker />
          <SleepTracker />
          <MoodTracker />
        </div>

        <div className="bottom-grid">
          <Appointments />
          <Reminders />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
