class ProjectService {
  constructor() {
    // Initialize ApperClient with Project ID and Public Key
    const { ApperClient } = window.ApperSDK;
    this.apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    this.tableName = 'project_c';
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
          { field: { Name: "description_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "repositoryUrl_c" } }
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
      return response.data.map(project => ({
        Id: project.Id,
        name: project.Name,
        description: project.description_c || '',
        color: project.color_c || '#00D9FF',
        createdAt: project.createdAt_c || project.CreatedOn,
        repositoryUrl: project.repositoryUrl_c || '',
        tags: project.Tags || '',
        owner: project.Owner
      }));
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error fetching projects:", error?.response?.data?.message);
      } else {
        console.error("Error fetching projects:", error.message);
      }
      throw error;
    }
  }

  async getById(id) {
    try {
      if (!id) {
        throw new Error("Project ID is required");
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
          { field: { Name: "description_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "createdAt_c" } },
          { field: { Name: "repositoryUrl_c" } }
        ]
      };

      const response = await this.apperClient.getRecordById(this.tableName, parseInt(id), params);
      
      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (!response.data) {
        throw new Error(`Project not found with ID: ${id}`);
      }

      // Map database fields to UI expected format
      const project = response.data;
      return {
        Id: project.Id,
        name: project.Name,
        description: project.description_c || '',
        color: project.color_c || '#00D9FF',
        createdAt: project.createdAt_c || project.CreatedOn,
        repositoryUrl: project.repositoryUrl_c || '',
        tags: project.Tags || '',
        owner: project.Owner
      };
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error(`Error fetching project with ID ${id}:`, error?.response?.data?.message);
      } else {
        console.error(`Error fetching project with ID ${id}:`, error.message);
      }
      throw error;
    }
  }

  async create(projectData) {
    try {
      // Only include Updateable fields based on field visibility
      const params = {
        records: [
          {
            Name: projectData.name || '',
            Tags: projectData.tags || '',
            Owner: projectData.owner || '',
            description_c: projectData.description || '',
            color_c: projectData.color || '#00D9FF',
            createdAt_c: new Date().toISOString(),
            repositoryUrl_c: projectData.repositoryUrl || ''
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
          console.error(`Failed to create ${failedRecords.length} projects:${JSON.stringify(failedRecords)}`);
          
          failedRecords.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulRecords.length > 0) {
          const project = successfulRecords[0].data;
          return {
            Id: project.Id,
            name: project.Name,
            description: project.description_c || '',
            color: project.color_c || '#00D9FF',
            createdAt: project.createdAt_c || project.CreatedOn,
            repositoryUrl: project.repositoryUrl_c || '',
            tags: project.Tags || '',
            owner: project.Owner
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error creating project:", error?.response?.data?.message);
      } else {
        console.error("Error creating project:", error.message);
      }
      throw error;
    }
  }

  async update(id, projectData) {
    try {
      // Only include Updateable fields based on field visibility
      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: projectData.name || '',
            Tags: projectData.tags || '',
            Owner: projectData.owner || '',
            description_c: projectData.description || '',
            color_c: projectData.color || '#00D9FF',
            repositoryUrl_c: projectData.repositoryUrl || ''
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
          console.error(`Failed to update ${failedUpdates.length} projects:${JSON.stringify(failedUpdates)}`);
          
          failedUpdates.forEach(record => {
            record.errors?.forEach(error => {
              throw new Error(`${error.fieldLabel}: ${error.message}`);
            });
            if (record.message) throw new Error(record.message);
          });
        }
        
        if (successfulUpdates.length > 0) {
          const project = successfulUpdates[0].data;
          return {
            Id: project.Id,
            name: project.Name,
            description: project.description_c || '',
            color: project.color_c || '#00D9FF',
            createdAt: project.createdAt_c || project.CreatedOn,
            repositoryUrl: project.repositoryUrl_c || '',
            tags: project.Tags || '',
            owner: project.Owner
          };
        }
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error updating project:", error?.response?.data?.message);
      } else {
        console.error("Error updating project:", error.message);
      }
      throw error;
    }
  }

  async delete(id) {
    try {
      if (!id) {
        throw new Error("Project ID is required for deletion");
      }

      // First delete associated tasks
      await this.deleteAssociatedTasks(id);

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
          console.error(`Failed to delete ${failedDeletions.length} projects:${JSON.stringify(failedDeletions)}`);
          
          failedDeletions.forEach(record => {
            if (record.message) throw new Error(record.message);
          });
        }
        
        return successfulDeletions.length > 0;
      }
    } catch (error) {
      if (error?.response?.data?.message) {
        console.error("Error deleting project:", error?.response?.data?.message);
      } else {
        console.error("Error deleting project:", error.message);
      }
      throw error;
    }
  }

  async deleteAssociatedTasks(projectId) {
    try {
      // Import taskService to delete associated tasks
      const { taskService } = await import('./taskService.js');
      await taskService.deleteByProjectId(projectId);
    } catch (error) {
      console.error("Error deleting associated tasks:", error.message);
      // Continue with project deletion even if task deletion fails
    }
  }
}

export const projectService = new ProjectService()