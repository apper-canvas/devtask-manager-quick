import { useState, useContext } from "react"
import NavigationItem from "@/components/molecules/NavigationItem"
import ApperIcon from "@/components/ApperIcon"
import Button from "@/components/atoms/Button"
import { AuthContext } from "@/App"

const LogoutButton = () => {
  const { logout } = useContext(AuthContext);
  
  return (
    <Button
      onClick={logout}
      variant="ghost"
      size="sm"
      className="w-full text-gray-400 hover:text-white hover:bg-gray-700/50 justify-start"
    >
      <ApperIcon name="LogOut" size={16} className="mr-2" />
      Logout
    </Button>
  );
};
const Sidebar = () => {
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleMobile = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobile}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-surface border border-gray-600 rounded-lg"
      >
        <ApperIcon name="Menu" size={20} className="text-white" />
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={toggleMobile}
        />
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-surface border-r border-gray-600 h-full">
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Code2" size={18} className="text-background" />
            </div>
            <h1 className="text-xl font-mono font-bold text-white">DevTask</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavigationItem to="/" icon="LayoutDashboard">
            Dashboard
          </NavigationItem>
          <NavigationItem to="/tasks" icon="CheckSquare">
            Tasks
          </NavigationItem>
          <NavigationItem to="/projects" icon="FolderOpen">
            Projects
          </NavigationItem>
        </nav>
        
<div className="p-4 border-t border-gray-600">
          <div className="text-xs text-gray-500 mb-3">
            <p className="mb-1">Developer Tools</p>
            <p>Stay focused, ship code</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed left-0 top-0 z-50 w-60 h-full bg-surface border-r border-gray-600 transform transition-transform duration-300 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="p-6 border-b border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                <ApperIcon name="Code2" size={18} className="text-background" />
              </div>
              <h1 className="text-xl font-mono font-bold text-white">DevTask</h1>
            </div>
            <button
              onClick={toggleMobile}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={18} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <NavigationItem to="/" icon="LayoutDashboard" onClick={toggleMobile}>
            Dashboard
          </NavigationItem>
          <NavigationItem to="/tasks" icon="CheckSquare" onClick={toggleMobile}>
            Tasks
          </NavigationItem>
          <NavigationItem to="/projects" icon="FolderOpen" onClick={toggleMobile}>
            Projects
          </NavigationItem>
        </nav>
        
<div className="p-4 border-t border-gray-600">
          <div className="text-xs text-gray-500 mb-3">
            <p className="mb-1">Developer Tools</p>
            <p>Stay focused, ship code</p>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  )
}

export default Sidebar