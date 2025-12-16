// User Profile Page
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { User } from "lucide-react";

export default function UserProfiles() {
  const { user } = useAuth();

  return (
    <div className="p-4 md:p-6 lg:p-10 space-y-6">
      <div className="flex items-center gap-3">
        <User className="h-8 w-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          User Profile
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-semibold">
                {user?.user_name?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.user_name || "User"}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 capitalize">
                {user?.role || "User"}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                User ID
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.id || "—"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Username
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {user?.user_name || "—"}
              </p>
            </div>

            {user?.employee_id && (
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Employee ID
                </label>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {user.employee_id}
                </p>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Role
              </label>
              <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                {user?.role || "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}





