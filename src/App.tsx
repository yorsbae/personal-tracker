import { useEffect } from "react";
import type { ReactNode } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { PinLockProvider, usePinLock } from "./context/PinLockContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import LockScreen from "./components/LockScreen";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import ExpensePage from "./features/expense/ExpensePage";
import IncomePage from "./features/income/IncomePage";
import ExercisePage from "./features/exercise/ExercisePage";
import CalendarPage from "./features/calendar/CalendarPage";
import DashboardPage from "./features/dashboard/DashboardPage";
import MoneyPage from "./features/money/MoneyPage";
import MindGrowthPage from "./features/mindgrowth/MindGrowthPage";
import CreativeBrainPage from "./features/creative/CreativeBrainPage";
import NotesPage from "./features/notes/NotesPage";
import AnalyticsPage from "./features/analytics/AnalyticsPage";
import ProfilePage from "./features/profile/ProfilePage";
import DevProjectsPage from "./features/devprojects/DevProjectsPage";
import FocusModePage from "./features/focus/FocusModePage";
import GoalsPage from "./features/goals/GoalsPage";
import SocialAccountsPage from "./features/socialaccounts/SocialAccountsPage";
import AchievementsPage from "./features/achievements/AchievementsPage";
import OnboardingPage from "./features/onboarding/OnboardingPage";
import { useProfile } from "./features/profile/useProfile";

// Placeholder sementara - akan diganti komponen asli di step berikutnya
// function ComingSoon({ nama }: { nama: string }) {
//   return (
//     <div className="p-8 text-center">
//       <p className="text-gray-400 dark:text-gray-500">
//         {nama} — akan dibangun di step berikutnya
//       </p>
//     </div>
//   );
// }

function withLayout(element: ReactNode) {
  return (
    <ProtectedRoute>
      <Layout>{element}</Layout>
    </ProtectedRoute>
  );
}

// Komponen ini nge-cek status lock, ditaruh DI DALAM AuthProvider+PinLockProvider
// supaya bisa akses context-nya, lalu tampilkan LockScreen di atas semua halaman kalau terkunci
// Cek status onboarding, arahkan ke /onboarding kalau belum selesai (kecuali sedang di halaman itu sendiri)
function OnboardingGate() {
  const { profile, loading } = useProfile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const publicPaths = ["/login", "/register", "/onboarding"];
    if (publicPaths.includes(location.pathname)) return;
    // Redirect ke onboarding kalau: belum pernah isi onboarding, ATAU belum ada row profile sama sekali
    if (!profile || profile.onboarding_done === false) {
      navigate("/onboarding");
    }
  }, [profile, loading, location.pathname]);

  return null;
}

function AppContent() {
  const { isLocked } = usePinLock();

  return (
    <BrowserRouter>
      {isLocked && <LockScreen />}
      <OnboardingGate />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              <OnboardingPage />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={withLayout(<DashboardPage />)} />

        {/* Money - halaman gabungan Ringkasan+Expense+Income+Wishlist */}
        <Route path="/money" element={withLayout(<MoneyPage />)} />
        <Route path="/expenses" element={withLayout(<ExpensePage />)} />
        <Route path="/incomes" element={withLayout(<IncomePage />)} />

        <Route path="/exercises" element={withLayout(<ExercisePage />)} />
        <Route path="/mind-growth" element={withLayout(<MindGrowthPage />)} />

        <Route path="/creative" element={withLayout(<CreativeBrainPage />)} />
        <Route path="/notes" element={withLayout(<NotesPage />)} />

        <Route path="/calendar" element={withLayout(<CalendarPage />)} />
        <Route path="/analytics" element={withLayout(<AnalyticsPage />)} />
        <Route path="/profile" element={withLayout(<ProfilePage />)} />
        <Route path="/projects" element={withLayout(<DevProjectsPage />)} />
        <Route path="/goals" element={withLayout(<GoalsPage />)} />
        <Route
          path="/social-accounts"
          element={withLayout(<SocialAccountsPage />)}
        />
        <Route
          path="/achievements"
          element={withLayout(<AchievementsPage />)}
        />
        <Route
          path="/focus"
          element={
            <ProtectedRoute>
              <FocusModePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <PinLockProvider>
          <AppContent />
        </PinLockProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
