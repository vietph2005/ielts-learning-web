import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { UserMenu } from "../UserMenu";
import { BookOpen } from "lucide-react";

type Role = "teacher" | "manager";

interface StaffNavigationMenuProps {
  role: Role; // truyền từ context hoặc props
  onLogout?: () => void;
}

export function StaffNavigationMenu({ role, onLogout }: StaffNavigationMenuProps) {
  const handleLogout = () => {
    if (onLogout) onLogout();
    window.location.href = "/";
  };

  return (
    <div className="flex h-16 items-center px-4 container mx-auto">
      <NavigationMenu>
        <NavigationMenuList className="space-x-2">
          <NavigationMenuItem>
            <Link to="/staff-page" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">LANGUAGES</span>
            </Link>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {/* Menu động căn giữa */}
      <div className="flex-1 flex justify-center">
        <NavigationMenu>
          <NavigationMenuList className="space-x-2">
            {/* Teacher Menu */}
            {role === "teacher" && (
              <>
                <NavigationMenuItem>
                  <Link to="/manage-tests">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-semibold text-blue-600">
                      Manage Tests
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/add-test">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Add Test
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/grade-writing">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Grade Writing
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/add-vocabulary">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Add Vocabulary
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/teacher-scored-list">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Scored Writing
                    </Button>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
            {/* Manager Menu */}
            {role === "manager" && (
              <>
                <NavigationMenuItem>
                  <NavigationMenuTrigger className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                    User Management
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <div className="grid gap-3 p-4 w-[400px] bg-white rounded-xl shadow-lg border border-slate-200">
                      <NavigationMenuLink asChild>
                        <Link to="/manage-students" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100">
                          <div className="text-sm font-medium leading-none text-slate-900">Student Management</div>
                          <p className="line-clamp-2 text-sm leading-snug text-slate-600 mt-1">
                            View, add, edit, and remove students
                          </p>
                        </Link>
                      </NavigationMenuLink>
                      <NavigationMenuLink asChild>
                        <Link to="/manage-teachers" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-slate-100">
                          <div className="text-sm font-medium leading-none text-slate-900">Teacher Management</div>
                          <p className="line-clamp-2 text-sm leading-snug text-slate-600 mt-1">
                            View, add, edit, and remove teachers
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </div>
                  </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/handle-reports">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Handle Reports
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/transactions">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Transaction Report
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/transactions-history">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Transaction History
                    </Button>
                  </Link>
                </NavigationMenuItem>
                <NavigationMenuItem>
                  <Link to="/accept-tests">
                    <Button variant="ghost" className="text-slate-600 hover:text-slate-900 hover:bg-slate-100">
                      Accept Tests
                    </Button>
                  </Link>
                </NavigationMenuItem>
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
      <div className="ml-auto flex items-center space-x-4">
        <span className="text-sm text-slate-600">
          Role: <strong>{role === "teacher" ? "Teacher" : "Manager"}</strong>
        </span>
        <UserMenu onLogout={handleLogout} />
      </div>
    </div>
  );
}
