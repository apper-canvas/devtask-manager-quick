import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { taskService } from "@/services/api/taskService";
import { projectService } from "@/services/api/projectService";
import ApperIcon from "@/components/ApperIcon";
import Textarea from "@/components/atoms/Textarea";
import Badge from "@/components/atoms/Badge";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Select from "@/components/atoms/Select";

const TaskDetailsModal = ({ isOpen, onClose, task, onTaskUpdated, onTaskDeleted }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    projectId: "",
    priority: "medium",
    status: "todo",
    gitBranch: "",
    codeSnippet: "",
    resourceLinks: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSettingActive, setIsSettingActive] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (task) {
setFormData({
        title: task.title || "",
        description: task.description || "",
        projectId: task.projectId ? task.projectId.toString() : "",
        priority: task.priority || "medium",
        status: task.status || "todo",
        gitBranch: task.gitBranch || "",
        codeSnippet: task.codeSnippet || "",
        resourceLinks: task.resourceLinks || ""
      });
    }
  }, [task]);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await projectService.getAll();
        setProjects(projectsData);
      } catch (error) {
        console.error("Failed to load projects:", error);
      }
    };
    if (isOpen) {
      loadProjects();
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedTask = await taskService.update(task.Id, {
        ...formData,
        updatedAt: new Date().toISOString()
      });
      
      onTaskUpdated(updatedTask);
      setIsEditing(false);
      toast.success("Task updated successfully!");
    } catch (error) {
      toast.error("Failed to update task");
    } finally {
      setIsSubmitting(false);
    }
  };

const handleSetActive = async () => {
    setIsSettingActive(true);
    try {
      await taskService.setActive(task.Id);
      toast.success("Task set as active!");
      // Update the task in parent component
      const updatedTask = await taskService.getById(task.Id);
      onTaskUpdated(updatedTask);
    } catch (error) {
      toast.error("Failed to set task as active");
    } finally {
      setIsSettingActive(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onTaskDeleted(task.Id);
      setShowDeleteConfirm(false);
    } catch (error) {
      // Error handling is done in parent component
    } finally {
      setIsDeleting(false);
    }
  };

const handleCancel = () => {
setFormData({
      title: task.title || "",
      description: task.description || "",
      projectId: task.projectId ? task.projectId.toString() : "",
      priority: task.priority || "medium",
      status: task.status || "todo",
      gitBranch: task.gitBranch || "",
      codeSnippet: task.codeSnippet || "",
      resourceLinks: task.resourceLinks || ""
    });
    setIsEditing(false);
  };
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'medium': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'low': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'inProgress': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'done': return 'bg-green-500/10 text-green-400 border-green-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getProject = () => {
    return projects.find(p => p.Id === parseInt(task?.projectId));
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-surface border border-gray-600 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-600">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-mono font-semibold text-white">
              {isEditing ? "Edit Task" : "Task Details"}
            </h2>
            <div className="flex items-center gap-2">
              <Badge className={getPriorityColor(task.priority)}>
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)}>
                {task.status}
              </Badge>
            </div>
          </div>
<div className="flex items-center gap-2">
            {!isEditing && (
              <>
<Button
onClick={handleSetActive}
                  disabled={isSettingActive || task.isActive || task.status === 'done'}
                  variant="ghost"
                  size="sm"
                  className={
                    task.status === 'done' 
                      ? "text-success bg-success/10" 
                      : task.isActive 
                        ? "text-accent bg-accent/10" 
                        : "text-accent hover:bg-accent/10"
                  }
                >
                  <ApperIcon 
                    name={
                      task.status === 'done' 
                        ? "CheckCircle" 
                        : task.isActive 
                          ? "CheckCircle" 
                          : "Play"
                    } 
                    size={16} 
                    className="mr-2" 
                  />
                  {isSettingActive 
                    ? "Setting..." 
                    : task.status === 'done' 
                      ? "Done" 
                      : task.isActive 
                        ? "Active Task" 
                        : "Set as Active"
                  }
                </Button>
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary/10"
                >
                  <ApperIcon name="Edit" size={16} className="mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={() => setShowDeleteConfirm(true)}
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error/10"
                >
                  <ApperIcon name="Trash2" size={16} className="mr-2" />
                  Delete
                </Button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ApperIcon name="X" size={20} className="text-gray-400" />
            </button>
          </div>
        </div>

        <div className="flex flex-col max-h-[calc(90vh-8rem)]">
          <div className="overflow-y-auto flex-1 px-6 py-6">
            {isEditing ? (
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Basic Information
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Task Title
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter task title..."
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <Textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Enter task description..."
                      rows={4}
                    />
                  </div>
                </div>

                {/* Assignment Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Assignment & Status
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Project
                    </label>
<Select name="projectId" value={formData.projectId} onChange={handleChange}>
                      <option value="">Select a project...</option>
                      {projects.map(project => (
                        <option key={project.Id} value={project.Id.toString()}>
                          {project.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Priority
                      </label>
                      <Select
                        name="priority"
                        value={formData.priority}
                        onChange={handleChange}
                      >
                        <option value="high">High Priority</option>
                        <option value="medium">Medium Priority</option>
                        <option value="low">Low Priority</option>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Status
                      </label>
                      <Select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                      >
                        <option value="todo">To Do</option>
                        <option value="inProgress">In Progress</option>
                        <option value="done">Done</option>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Development Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Development Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Git Branch
                    </label>
                    <Input
                      name="gitBranch"
                      value={formData.gitBranch}
                      onChange={handleChange}
                      placeholder="feature/task-branch-name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Code Snippet
                    </label>
                    <Textarea
                      name="codeSnippet"
                      value={formData.codeSnippet}
                      onChange={handleChange}
                      placeholder="Relevant code snippets..."
                      rows={6}
                      className="font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Resource Links
                    </label>
                    <Textarea
                      name="resourceLinks"
                      value={formData.resourceLinks}
                      onChange={handleChange}
                      placeholder="https://example.com/docs&#10;https://github.com/repo/issues/123"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Basic Information
                  </h3>
                  <div>
                    <h4 className="text-2xl font-bold text-white mb-2">{task.title}</h4>
                    {task.description && (
                      <p className="text-gray-300 leading-relaxed">{task.description}</p>
                    )}
                  </div>
                  {getProject() && (
                    <div>
                      <span className="text-sm font-medium text-gray-400">Project: </span>
                      <span className="text-white">{getProject().name}</span>
                    </div>
                  )}
                </div>

                {/* Timestamps Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                    Timeline
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ApperIcon name="Plus" size={16} className="text-green-400" />
                        <span className="text-sm font-medium text-gray-400">Created</span>
                      </div>
                      <p className="text-white">
                        {task.createdAt ? format(new Date(task.createdAt), 'PPP p') : 'N/A'}
                      </p>
                    </div>
                    <div className="bg-gray-800/50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <ApperIcon name="Clock" size={16} className="text-blue-400" />
                        <span className="text-sm font-medium text-gray-400">Last Updated</span>
                      </div>
                      <p className="text-white">
                        {task.updatedAt ? format(new Date(task.updatedAt), 'PPP p') : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Development Section */}
                {(task.gitBranch || task.codeSnippet || task.resourceLinks) && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white border-b border-gray-700 pb-2">
                      Development Details
                    </h3>
                    
                    {task.gitBranch && (
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <ApperIcon name="GitBranch" size={16} className="text-purple-400" />
                          <span className="text-sm font-medium text-gray-400">Git Branch</span>
                        </div>
                        <code className="text-accent font-mono text-sm bg-gray-900 px-2 py-1 rounded">
                          {task.gitBranch}
                        </code>
                      </div>
                    )}

                    {task.codeSnippet && (
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <ApperIcon name="Code" size={16} className="text-orange-400" />
                          <span className="text-sm font-medium text-gray-400">Code Snippet</span>
                        </div>
                        <pre className="text-sm text-gray-300 font-mono bg-gray-900 p-4 rounded-lg overflow-x-auto whitespace-pre-wrap break-words">
                          {task.codeSnippet}
                        </pre>
                      </div>
                    )}

                    {task.resourceLinks && (
                      <div className="bg-gray-800/50 p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-3">
                          <ApperIcon name="ExternalLink" size={16} className="text-blue-400" />
                          <span className="text-sm font-medium text-gray-400">Resource Links</span>
                        </div>
                        <div className="space-y-2">
                          {task.resourceLinks.split('\n').filter(link => link.trim()).map((link, index) => (
                            <a
                              key={index}
                              href={link.trim()}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-primary hover:text-primary/80 text-sm underline break-all"
                            >
                              {link.trim()}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {isEditing && (
            <div className="p-6 border-t border-gray-600 bg-surface/50">
              <div className="flex justify-end gap-3">
                <Button
                  onClick={handleCancel}
                  variant="ghost"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={isSubmitting}
                  className="bg-primary text-black hover:bg-primary/90"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          )}
        </div>
</div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface border border-gray-600 rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-error/10 rounded-lg">
                <ApperIcon name="AlertTriangle" size={24} className="text-error" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Delete Task</h3>
                <p className="text-sm text-gray-400">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete "<span className="font-medium text-white">{task.title}</span>"?
            </p>
            
            <div className="flex justify-end gap-3">
              <Button
                onClick={() => setShowDeleteConfirm(false)}
                variant="ghost"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-error text-white hover:bg-error/90"
              >
                {isDeleting ? "Deleting..." : "Delete Task"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskDetailsModal;