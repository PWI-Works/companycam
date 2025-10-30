import type {
  Checklist,
  Comment,
  CreateProjectChecklistRequestBody,
  CreateProjectCommentRequestBody,
  CreateProjectDocumentRequestBody,
  CreateProjectLabelsRequestBody,
  CreateProjectPhotoRequestBody,
  CreateProjectRequestBody,
  Document,
  ListProjectPhotosQueryParams,
  ListProjectsQueryParams,
  PaginationQueryParams,
  Photo,
  Project,
  ProjectCollaborator,
  ProjectInvitation,
  ProjectNotepad,
  Tag,
  UpdateProjectNotepadRequestBody,
  UpdateProjectRequestBody,
  User,
} from "../interfaces.js";
import type { HttpClient } from "../http/HttpClient.js";
import {
  buildRequestConfig,
  cleanQueryParameters,
  encodePathParam,
  RequestOptions,
  splitUserScopedOptions,
  UserScopedRequestOptions,
} from "./utils.js";

/**
 * Resource handling operations on projects and their associated sub-resources.
 */
export class ProjectsResource {
  readonly photos: ProjectPhotosResource;
  readonly assignees: ProjectAssigneesResource;
  readonly notepad: ProjectNotepadResource;
  readonly collaborators: ProjectCollaboratorsResource;
  readonly invitations: ProjectInvitationsResource;
  readonly labels: ProjectLabelsResource;
  readonly documents: ProjectDocumentsResource;
  readonly comments: ProjectCommentsResource;
  readonly checklists: ProjectChecklistsResource;

  constructor(private readonly http: HttpClient) {
    this.photos = new ProjectPhotosResource(http);
    this.assignees = new ProjectAssigneesResource(http);
    this.notepad = new ProjectNotepadResource(http);
    this.collaborators = new ProjectCollaboratorsResource(http);
    this.invitations = new ProjectInvitationsResource(http);
    this.labels = new ProjectLabelsResource(http);
    this.documents = new ProjectDocumentsResource(http);
    this.comments = new ProjectCommentsResource(http);
    this.checklists = new ProjectChecklistsResource(http);
  }

  /**
   * Retrieve a paginated list of projects for the company.
   */
  async list(
    query?: ListProjectsQueryParams,
    options?: RequestOptions
  ): Promise<Project[]> {
    const response = await this.http.request<Project[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/projects",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Create a new project.
   */
  async create(
    body: CreateProjectRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Project> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Project>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: "/projects",
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }

  /**
   * Retrieve a single project by identifier.
   */
  async retrieve(projectId: string, options?: RequestOptions): Promise<Project> {
    const response = await this.http.request<Project>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}`,
    });

    return response.data;
  }

  /**
   * Update the core attributes of a project.
   */
  async update(
    projectId: string,
    body: UpdateProjectRequestBody,
    options?: RequestOptions
  ): Promise<Project> {
    const response = await this.http.request<Project>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/projects/${encodePathParam(projectId)}`,
      data: body,
    });

    return response.data;
  }

  /**
   * Permanently delete a project.
   */
  async delete(projectId: string, options?: RequestOptions): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/projects/${encodePathParam(projectId)}`,
    });
  }

  /**
   * Archive a project to remove it from active listings.
   */
  async archive(projectId: string, options?: RequestOptions): Promise<Project> {
    const response = await this.http.request<Project>({
      ...buildRequestConfig(options),
      method: "PATCH",
      url: `/projects/${encodePathParam(projectId)}/archive`,
    });

    return response.data;
  }

  /**
   * Restore an archived project back to active status.
   */
  async restore(projectId: string, options?: RequestOptions): Promise<Project> {
    const response = await this.http.request<Project>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/projects/${encodePathParam(projectId)}/restore`,
    });

    return response.data;
  }
}

/**
 * Manage photos attached to a project.
 */
export class ProjectPhotosResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List photos associated with a project with optional filtering.
   */
  async list(
    projectId: string,
    query?: ListProjectPhotosQueryParams,
    options?: RequestOptions
  ): Promise<Photo[]> {
    const response = await this.http.request<Photo[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/photos`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Upload a new project photo via URI payload.
   */
  async create(
    projectId: string,
    body: CreateProjectPhotoRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Photo> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Photo>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/photos`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }
}

/**
 * Manage project assignees.
 */
export class ProjectAssigneesResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List users assigned to a project.
   */
  async list(
    projectId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<User[]> {
    const response = await this.http.request<User[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/assigned_users`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Assign a user to the project.
   */
  async assign(
    projectId: string,
    userId: string,
    options?: UserScopedRequestOptions
  ): Promise<User> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<User>({
      ...buildRequestConfig(requestOptions),
      method: "PUT",
      url: `/projects/${encodePathParam(projectId)}/assigned_users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });

    return response.data;
  }

  /**
   * Remove a user assignment from the project.
   */
  async remove(
    projectId: string,
    userId: string,
    options?: UserScopedRequestOptions
  ): Promise<void> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    await this.http.request<void>({
      ...buildRequestConfig(requestOptions),
      method: "DELETE",
      url: `/projects/${encodePathParam(projectId)}/assigned_users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });
  }
}

/**
 * Manage the free-form project notepad content.
 */
export class ProjectNotepadResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Update the notepad content for a project.
   */
  async update(
    projectId: string,
    body: UpdateProjectNotepadRequestBody,
    options?: RequestOptions
  ): Promise<ProjectNotepad> {
    const response = await this.http.request<ProjectNotepad>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/projects/${encodePathParam(projectId)}/notepad`,
      data: body,
    });

    return response.data;
  }
}

/**
 * Access the external collaborators associated with a project.
 */
export class ProjectCollaboratorsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List collaborators invited to the project.
   */
  async list(
    projectId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<ProjectCollaborator[]> {
    const response = await this.http.request<ProjectCollaborator[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/collaborators`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }
}

/**
 * Manage project invitations for external collaborators.
 */
export class ProjectInvitationsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List all invitations issued for the project.
   */
  async list(
    projectId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<ProjectInvitation[]> {
    const response = await this.http.request<ProjectInvitation[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/invitations`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Issue a new project invitation.
   */
  async create(
    projectId: string,
    options?: UserScopedRequestOptions
  ): Promise<ProjectInvitation> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<ProjectInvitation>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/invitations`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });

    return response.data;
  }
}

/**
 * Manage project labels.
 */
export class ProjectLabelsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List labels that have been applied to the project.
   */
  async list(
    projectId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Tag[]> {
    const response = await this.http.request<Tag[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/labels`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Apply new labels to the project.
   */
  async create(
    projectId: string,
    body: CreateProjectLabelsRequestBody,
    options?: RequestOptions
  ): Promise<Tag> {
    const response = await this.http.request<Tag>({
      ...buildRequestConfig(options),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/labels`,
      data: body,
    });

    return response.data;
  }

  /**
   * Remove a label from the project.
   */
  async delete(
    projectId: string,
    labelId: string,
    options?: RequestOptions
  ): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/projects/${encodePathParam(projectId)}/labels/${encodePathParam(labelId)}`,
    });
  }
}

/**
 * Manage documents stored on a project.
 */
export class ProjectDocumentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List documents uploaded to the project.
   */
  async list(
    projectId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Document[]> {
    const response = await this.http.request<Document[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/documents`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Upload a new document to the project.
   */
  async create(
    projectId: string,
    body: CreateProjectDocumentRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Document> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Document>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/documents`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }
}

/**
 * Manage threaded comments on a project.
 */
export class ProjectCommentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List comments recorded on the project.
   */
  async list(
    projectId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Comment[]> {
    const response = await this.http.request<Comment[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/comments`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Add a comment to the project discussion.
   */
  async create(
    projectId: string,
    body: CreateProjectCommentRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Comment> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Comment>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/comments`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }
}

/**
 * Manage checklists attached to a project.
 */
export class ProjectChecklistsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List checklists belonging to the project.
   */
  async list(
    projectId: string,
    options?: RequestOptions
  ): Promise<Checklist[]> {
    const response = await this.http.request<Checklist[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/checklists`,
    });

    return response.data;
  }

  /**
   * Create a checklist on the project, optionally from a template.
   */
  async create(
    projectId: string,
    body: CreateProjectChecklistRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Checklist> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Checklist>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/checklists`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }

  /**
   * Retrieve a single checklist associated with the project.
   */
  async retrieve(
    projectId: string,
    checklistId: string,
    options?: RequestOptions
  ): Promise<Checklist> {
    const response = await this.http.request<Checklist>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}/checklists/${encodePathParam(checklistId)}`,
    });

    return response.data;
  }
}
