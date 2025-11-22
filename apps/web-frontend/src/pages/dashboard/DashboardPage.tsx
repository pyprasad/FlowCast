import { useAuthStore } from '../../stores/auth.store';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        Welcome back, {user?.email}!
      </h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total Videos</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">24</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total Views</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">1.2M</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Engagement Rate</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">8.5%</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Scheduled Posts</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">12</p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Videos</h2>
          <p className="text-gray-500">Your recently uploaded videos will appear here.</p>
        </div>

        <div className="card">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="btn btn-primary w-full">Upload Video</button>
            <button className="btn btn-secondary w-full">Schedule Post</button>
            <button className="btn btn-secondary w-full">Connect Platform</button>
          </div>
        </div>
      </div>
    </div>
  );
}
