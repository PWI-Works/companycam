import type {
  Checklist,
  Comment,
  Document,
  ListProjectPhotosQueryParams,
  ListProjectsQueryParams,
  PaginationQueryParams,
  Photo,
  Project,
  ProjectCollaborator,
  ProjectCreatePayload,
  ProjectMutable,
  ProjectInvitation,
  ProjectNotepad,
  ProjectNotepadMutable,
  Tag,
  User,
  PhotoMutable,
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
 * Exposes nested helpers for photos, assignees, collaborators, invitations, labels,
 * documents, comments, and checklists. All requests propagate APIError on failure.
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
   *
   * @param query Optional filters and pagination controls declared in the spec.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Project} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param project Mutable attributes comprising the project creation payload.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The newly created {@link Project}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    project: ProjectCreatePayload,
    options?: UserScopedRequestOptions
  ): Promise<Project> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Project>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: "/projects",
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: project,
    });

    return response.data;
  }

  /**
   * Retrieve a single project by identifier.
   *
   * @param projectId Identifier of the project to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link Project}.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(
    projectId: string,
    options?: RequestOptions
  ): Promise<Project> {
    const response = await this.http.request<Project>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(projectId)}`,
    });

    return response.data;
  }

  /**
   * Update the core attributes of a project.
   *
   * @param projectId Identifier of the project to update.
   * @param updates Attributes describing the replacement project state.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link Project}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    projectId: string,
    updates: ProjectMutable,
    options?: RequestOptions
  ): Promise<Project> {
    const response = await this.http.request<Project>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/projects/${encodePathParam(projectId)}`,
      data: updates,
    });

    return response.data;
  }

  /**
   * Permanently delete a project.
   *
   * @param projectId Identifier of the project to delete.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to archive.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The archived {@link Project}.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to restore.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The restored {@link Project}.
   * @throws {APIError} When the API responds with an error status.
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
 * Manage photos attached to a project. Methods mirror the project photo endpoints and
 * propagate APIError on failure.
 */
export class ProjectPhotosResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List photos associated with a project with optional filtering.
   *
   * @param projectId Identifier of the project whose photos are requested.
   * @param query Pagination and filtering parameters declared in the spec.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Photo} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project that owns the photo.
   * @param photo Photo metadata matching the spec-defined payload.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link Photo}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    projectId: string,
    photo: PhotoMutable,
    options?: UserScopedRequestOptions
  ): Promise<Photo> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Photo>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/photos`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: { photo },
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link User} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to update.
   * @param userId Identifier of the user to assign.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The updated {@link User} assignment payload.
   * @throws {APIError} When the API responds with an error status.
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
      url: `/projects/${encodePathParam(
        projectId
      )}/assigned_users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });

    return response.data;
  }

  /**
   * Remove a user assignment from the project.
   *
   * @param projectId Identifier of the project to update.
   * @param userId Identifier of the user assignment to remove.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns Resolves to void when removal succeeds.
   * @throws {APIError} When the API responds with an error status.
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
      url: `/projects/${encodePathParam(
        projectId
      )}/assigned_users/${encodePathParam(userId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });
  }
}

/**
 * Manage the free-form project notepad content associated with a project.
 */
export class ProjectNotepadResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Update the notepad content for a project.
   *
   * @param projectId Identifier of the project whose notepad should be updated.
   * @param payload New notepad content pulled directly from the spec.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link ProjectNotepad}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    projectId: string,
    payload: ProjectNotepadMutable,
    options?: RequestOptions
  ): Promise<ProjectNotepad> {
    const response = await this.http.request<ProjectNotepad>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/projects/${encodePathParam(projectId)}/notepad`,
      data: payload,
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link ProjectCollaborator} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link ProjectInvitation} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project sending the invitation.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link ProjectInvitation}.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Tag} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to update.
   * @param labels Labels to associate with the project, matching the spec schema.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The {@link Tag} response returned by the API.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    projectId: string,
    labels: string[],
    options?: RequestOptions
  ): Promise<Tag> {
    const response = await this.http.request<Tag>({
      ...buildRequestConfig(options),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/labels`,
      data: { project: { labels } },
    });

    return response.data;
  }

  /**
   * Remove a label from the project.
   *
   * @param projectId Identifier of the project to update.
   * @param labelId Identifier of the label to remove.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
   */
  async delete(
    projectId: string,
    labelId: string,
    options?: RequestOptions
  ): Promise<void> {
    await this.http.request<void>({
      ...buildRequestConfig(options),
      method: "DELETE",
      url: `/projects/${encodePathParam(projectId)}/labels/${encodePathParam(
        labelId
      )}`,
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Document} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project that owns the document.
   * @param document Document payload providing metadata and attachment.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link Document}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    projectId: string,
    document: {
      name?: Document["name"];
      attachment?: string;
    },
    options?: UserScopedRequestOptions
  ): Promise<Document> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Document>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/documents`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: { document },
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Comment} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to update.
   * @param content Comment body text to submit.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link Comment}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    projectId: string,
    content: string,
    options?: UserScopedRequestOptions
  ): Promise<Comment> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Comment>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/comments`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: { comment: { content } },
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
   *
   * @param projectId Identifier of the project to inspect.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Checklist} records.
   * @throws {APIError} When the API responds with an error status.
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
   *
   * @param projectId Identifier of the project to update.
   * @param checklistTemplateId Optional template identifier drawn from the spec.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link Checklist}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    projectId: string,
    checklistTemplateId?: string,
    options?: UserScopedRequestOptions
  ): Promise<Checklist> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const data =
      checklistTemplateId !== undefined
        ? { checklist_template_id: checklistTemplateId }
        : {};
    const response = await this.http.request<Checklist>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/projects/${encodePathParam(projectId)}/checklists`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data,
    });

    return response.data;
  }

  /**
   * Retrieve a single checklist associated with the project.
   *
   * @param projectId Identifier of the project owning the checklist.
   * @param checklistId Identifier of the checklist to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link Checklist}.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(
    projectId: string,
    checklistId: string,
    options?: RequestOptions
  ): Promise<Checklist> {
    const response = await this.http.request<Checklist>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/projects/${encodePathParam(
        projectId
      )}/checklists/${encodePathParam(checklistId)}`,
    });

    return response.data;
  }
}
