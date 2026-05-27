import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Skeleton } from '../shared/components/ui';

const DashboardView          = lazy(() => import('../features/dashboard/views/DashboardView'));
const TodayView              = lazy(() => import('../features/habits/views/TodayView'));
const HabitsView             = lazy(() => import('../features/habits/views/HabitsView'));
const WorkoutsView           = lazy(() => import('../features/workouts/views/WorkoutsView'));
const NutritionView          = lazy(() => import('../features/nutrition/views/NutritionView'));
const JournalView            = lazy(() => import('../features/journal/views/JournalView'));
const TasksView              = lazy(() => import('../features/tasks/views/TasksView'));
const AssistantView          = lazy(() => import('../features/ai/views/AssistantView'));
const AnalyticsView          = lazy(() => import('../features/analytics/views/AnalyticsView'));
const SettingsView           = lazy(() => import('../features/settings/views/SettingsView'));
const ProfileSettingsView    = lazy(() => import('../features/settings/views/ProfileSettingsView'));
const AISettingsView         = lazy(() => import('../features/settings/views/AISettingsView'));
const NotificationsView      = lazy(() => import('../features/settings/views/NotificationsSettingsView'));
const DataSettingsView       = lazy(() => import('../features/settings/views/DataSettingsView'));
const GoalsHubView           = lazy(() => import('../features/goals/views/GoalsHubView'));
const GoalWizardView         = lazy(() => import('../features/goals/views/GoalWizardView'));

function PageFallback() {
  return (
    <div className="p-6 space-y-3">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-32 w-full mt-4" />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route path="/"                      element={<DashboardView />} />
        <Route path="/today"                 element={<TodayView />} />
        <Route path="/habits"                element={<HabitsView />} />
        <Route path="/workouts/*"            element={<WorkoutsView />} />
        <Route path="/nutrition/*"           element={<NutritionView />} />
        <Route path="/journal/*"             element={<JournalView />} />
        <Route path="/tasks/*"               element={<TasksView />} />
        <Route path="/goals"                 element={<GoalsHubView />} />
        <Route path="/goals/wizard"          element={<GoalWizardView />} />
        <Route path="/assistant"             element={<AssistantView />} />
        <Route path="/analytics"             element={<AnalyticsView />} />
        <Route path="/settings"              element={<SettingsView />} />
        <Route path="/settings/profile"      element={<ProfileSettingsView />} />
        <Route path="/settings/ai"           element={<AISettingsView />} />
        <Route path="/settings/notifications" element={<NotificationsView />} />
        <Route path="/settings/data"         element={<DataSettingsView />} />
        <Route path="*"                      element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
