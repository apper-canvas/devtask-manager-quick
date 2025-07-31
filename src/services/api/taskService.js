class TaskService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'task_c';
    this.activeTaskId = null;
  }

  async getAll() {
    try {
      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "projectId_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "updatedAt_c" } }
        ],
        orderBy: [
          {
            fieldName: "CreatedOn",
            sorttype: "DESC"
          }
        ],
        pagingInfo: {
          limit: 100,
          offset: 0
        }
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      // Map database fields to UI expected format
      return response.data.map(task => ({
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        projectId: task.projectId_c || '',
        priority: task.priority_c || 'medium',
        status: task.status_c || 'todo',
        createdAt: task.createdAt_c || task.CreatedOn,
        updatedAt: task.updatedAt_c || task.ModifiedOn,
        tags: task.Tags || '',
        owner: task.Owner,
        isActive: false // Default value, will be managed separately
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching tasks:", error?.response?.data?.message);
      } else {
        console.error("Error fetching tasks:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!id) {
        throw new Error("Task ID is required");
      }

      const params = {
        fields: [
          { field: { Name: "Name" } },
          { field: { Name: "Tags" } },
          { field: { Name: "Owner" } },
          { field: { Name: "CreatedOn" } },
          { field: { Name: "CreatedBy" } },
          { field: { Name: "ModifiedOn" } },
          { field: { Name: "ModifiedBy" } },
          { field: { Name: "title_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "projectId_c" } },
          { field: { Name: "priority_c" } },
          { field: { Name: "status_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "updatedAt_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error(`Task not found with ID: ${id}`);
      }

      // Map database fields to UI expected format
      const task = response.data;
      return {
        Id: task.Id,
        title: task.title_c || task.Name || '',
        description: task.description_c || '',
        projectId: task.projectId_c || '',
        priority: task.priority_c || 'medium',
        status: task.status_c || 'todo',
        createdAt: task.createdAt_c || task.CreatedOn,
        updatedAt: task.updatedAt_c || task.ModifiedOn,
        tags: task.Tags || '',
        owner: task.Owner,
        isActive: task.Id === this.activeTaskId
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching task with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching task with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(taskData) {
    try {
      // Only include Updateable fields based on field visibility
      const params = {
        records: [
          {
            Name: taskData.title || '',
            Tags: taskData.tags || '',
            Owner: taskData.owner || '',
            title_c: taskData.title || '',
            description_c: taskData.description || '',
            projectId_c: taskData.projectId || '',
            priority_c: taskData.priority || 'medium',
            status_c: taskData.status || 'todo',
            createdAt_c: new Date().toISOString(),
            updatedAt_c: new Date().toISOString()
          }
        ]
      };

      const response = await this.apperClient.createRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulRecords = response.results.filter(result => result.success);
        const failedRecords = response.results.filter(result => !result.success);
        
        if (failedRecords.length > 0) {
          console.error(`Failed to create ${failedRecords.length} tasks:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const task = successfulRecords[0].data;
          return {
            Id: task.Id,
            title: task.title_c || task.Name || '',
            description: task.description_c || '',
            projectId: task.projectId_c || '',
            priority: task.priority_c || 'medium',
            status: task.status_c || 'todo',
            createdAt: task.createdAt_c || task.CreatedOn,
            updatedAt: task.updatedAt_c || task.ModifiedOn,
            tags: task.Tags || '',
            owner: task.Owner,
            isActive: false
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating task:", error?.response?.data?.message);
      } else {
        console.error("Error creating task:", error.message);
      }
      throw error;
    }
  }

  async update(id, taskData) {
    try {
      // Only include Updateable fields based on field visibility
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: taskData.title || '',
            Tags: taskData.tags || '',
            Owner: taskData.owner || '',
            title_c: taskData.title || '',
            description_c: taskData.description || '',
            projectId_c: taskData.projectId || '',
            priority_c: taskData.priority || 'medium',
            status_c: taskData.status || 'todo',
            updatedAt_c: new Date().toISOString()
          }
        ]
      };

      const response = await this.apperClient.updateRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulUpdates = response.results.filter(result => result.success);
        const failedUpdates = response.results.filter(result => !result.success);
        
        if (failedUpdates.length > 0) {
          console.error(`Failed to update ${failedUpdates.length} tasks:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const task = successfulUpdates[0].data;
          return {
            Id: task.Id,
            title: task.title_c || task.Name || '',
            description: task.description_c || '',
            projectId: task.projectId_c || '',
            priority: task.priority_c || 'medium',
            status: task.status_c || 'todo',
            createdAt: task.createdAt_c || task.CreatedOn,
            updatedAt: task.updatedAt_c || task.ModifiedOn,
            tags: task.Tags || '',
            owner: task.Owner,
            isActive: task.Id === this.activeTaskId
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating task:", error?.response?.data?.message);
      } else {
        console.error("Error updating task:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!id) {
        throw new Error("Task ID is required for deletion");
      }

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await this.apperClient.deleteRecord(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const successfulDeletions = response.results.filter(result => result.success);
        const failedDeletions = response.results.filter(result => !result.success);
        
        if (failedDeletions.length > 0) {
          console.error(`Failed to delete ${failedDeletions.length} tasks:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting task:", error?.response?.data?.message);
      } else {
        console.error("Error deleting task:", error.message);
      }
      throw error;
    }
  }

  async deleteByProjectId(projectId) {
    try {
      // First get all tasks for this project
      const params = {
        fields: [
          { field: { Name: "Id" } }
        ],
        where: [
          {
            FieldName: "projectId_c",
            Operator: "EqualTo",
            Values: [String(projectId)]
          }
        ]
      };

      const response = await this.apperClient.fetchRecords(this.tableName, params);
      
      if (!response.success) {
        console.error(response.message);
        return [];
      }

      if (response.data && response.data.length > 0) {
        const taskIds = response.data.map(task => task.Id);
        
        const deleteParams = {
          RecordIds: taskIds
        };

        const deleteResponse = await this.apperClient.deleteRecord(this.tableName, deleteParams);
        
        if (!deleteResponse.success) {
          console.error(deleteResponse.message);
          throw new Error(deleteResponse.message);
        }

        return response.data;
      }

      return [];
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting tasks by project ID:", error?.response?.data?.message);
      } else {
        console.error("Error deleting tasks by project ID:", error.message);
      }
      return [];
    }
  }

  async setActive(id) {
    try {
      const taskId = parseInt(id);
      
      // First get the task to ensure it exists
      const task = await this.getById(taskId);
      if (!task) {
        throw new Error("Task not found");
      }
      
      // Set this task as active locally
      this.activeTaskId = taskId;
      
      // Return the task with active status
      return {
        ...task,
        isActive: true
      };
    } catch (error) {
      console.error("Error setting active task:", error.message);
      throw error;
    }
  }

  async getActiveTask() {
    try {
      if (!this.activeTaskId) {
        return null;
      }
      
      const task = await this.getById(this.activeTaskId);
      return task ? { ...task, isActive: true } : null;
    } catch (error) {
      console.error("Error getting active task:", error.message);
      return null;
    }
  }
}

export const taskService = new TaskService()