import { useState, useEffect } from "react"
import { toast } from "react-toastify"
import Button from "@/components/atoms/Button"
import ApperIcon from "@/components/ApperIcon"
import TaskCard from "@/components/molecules/TaskCard"
import AddTaskModal from "@/components/molecules/AddTaskModal"
import TaskDetailsModal from "@/components/molecules/TaskDetailsModal"
import Loading from "@/components/ui/Loading"
import Error from "@/components/ui/Error"
import Empty from "@/components/ui/Empty"
import { taskService } from "@/services/api/taskService"
import { projectService } from "@/services/api/projectService"

const Tasks = () => {
const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [filter, setFilter] = useState("all")
  const [projectFilter, setProjectFilter] = useState("all")
  const loadData = async () => {
    try {
      setLoading(true)
      setError("")
      const [tasksData, projectsData] = await Promise.all([
        taskService.getAll(),
        projectService.getAll()
      ])
      setTasks(tasksData)
      setProjects(projectsData)
    } catch (err) {
      setError("Failed to load tasks")
    } finally {
      setLoading(false)
    }
  }

useEffect(() => {
    loadData()
  }, [])

  // Reload data when window gains focus to catch external changes
  useEffect(() => {
    const handleFocus = () => {
      loadData()
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [])

const handleTaskAdded = (newTask) => {
    setTasks(prev => [newTask, ...prev])
  }

  const handleTaskUpdate = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ))
  }

  const handleTaskDelete = async (taskId) => {
    try {
      await taskService.delete(taskId)
      setTasks(prev => prev.filter(task => task.Id !== taskId))
      setIsDetailsModalOpen(false)
      toast.success("Task deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

const handleTaskClick = (task) => {
    setSelectedTask(task)
    setIsDetailsModalOpen(true)
  }

const handleTaskDetailsUpdated = (updatedTask) => {
    setTasks(prev => prev.map(task => 
      task.Id === updatedTask.Id ? updatedTask : task
    ))
    setSelectedTask(updatedTask) // Update selected task to reflect changes
  }

// Filter out tasks that reference deleted projects
  const validTasks = tasks.filter(task => {
    if (!task.projectId) return true
    return projects.some(project => project.Id == task.projectId)
  })

  const filteredTasks = validTasks.filter(task => {
    const statusMatch = filter === "all" || task.status === filter
    const projectMatch = projectFilter === "all" || task.projectId?.toString() === projectFilter
    return statusMatch && projectMatch
  })

  const getFilterCount = (status) => {
    const projectFilteredTasks = projectFilter === "all" 
      ? tasks 
      : tasks.filter(task => task.projectId?.toString() === projectFilter)
    
    if (status === "all") return projectFilteredTasks.length
    return projectFilteredTasks.filter(task => task.status === status).length
  }

  if (loading) return <Loading message="Loading tasks..." />
  if (error) return <Error message={error} onRetry={loadData} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-mono font-bold text-white mb-2">Tasks</h1>
          <p className="text-gray-400">Manage and track all your development tasks</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          Add Task
        </Button>
      </div>

{/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Project Filter */}
        <div className="flex items-center space-x-2">
          <ApperIcon name="FolderOpen" size={16} className="text-gray-400" />
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-surface border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:border-primary focus:outline-none"
          >
<option value="all">All Projects ({validTasks.length})</option>
            {projects.map(project => {
              const projectTaskCount = validTasks.filter(task => task.projectId == project.Id).length
              return (
                <option key={project.Id} value={project.Id}>
                  {project.name} ({projectTaskCount})
                </option>
              )
            })}
          </select>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex space-x-1 bg-surface/50 p-1 rounded-lg w-fit">
          {[
            { key: "all", label: "All", count: getFilterCount("all") },
            { key: "todo", label: "To Do", count: getFilterCount("todo") },
            { key: "inProgress", label: "In Progress", count: getFilterCount("inProgress") },
            { key: "done", label: "Done", count: getFilterCount("done") }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                filter === tab.key
                  ? "bg-primary text-background"
                  : "text-gray-400 hover:text-white hover:bg-surface"
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Tasks List */}
      {filteredTasks.length > 0 ? (
        <div className="grid gap-4">
          {filteredTasks.map(task => {
            const project = projects.find(p => p.Id === task.projectId)
            return (
<TaskCard
                key={task.Id}
                task={task}
                project={project}
                onTaskUpdate={handleTaskUpdate}
                onTaskClick={handleTaskClick}
              />
            )
          })}
        </div>
      ) : (
        <Empty
          title={filter === "all" ? "No tasks yet" : `No ${filter === "inProgress" ? "in progress" : filter} tasks`}
          description={filter === "all" 
            ? "Create your first task to get started with your development workflow"
            : `You don't have any ${filter === "inProgress" ? "in progress" : filter} tasks at the moment`
          }
          action={() => setIsAddModalOpen(true)}
          actionLabel="Create Task"
          icon="CheckSquare"
        />
      )}

<AddTaskModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        projects={projects}
        onTaskAdded={handleTaskAdded}
      />
      
<TaskDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        task={selectedTask}
        onTaskUpdated={handleTaskDetailsUpdated}
        onTaskDeleted={handleTaskDelete}
      />
    </div>
  )
}

export default Tasks