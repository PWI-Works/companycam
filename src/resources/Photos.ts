import type {
  Comment,
  CreatePhotoCommentRequestBody,
  CreatePhotoTagsRequestBody,
  ListPhotosQueryParams,
  PaginationQueryParams,
  Photo,
  Tag,
  UpdatePhotoDescriptionRequestBody,
  UpdatePhotoRequestBody,
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
 * Resource for working with photos and their nested relationships. Provides access to nested
 * helpers for tags, comments, and descriptions.
 */
export class PhotosResource {
  readonly tags: PhotoTagsResource;
  readonly comments: PhotoCommentsResource;
  readonly descriptions: PhotoDescriptionsResource;

  constructor(private readonly http: HttpClient) {
    this.tags = new PhotoTagsResource(http);
    this.comments = new PhotoCommentsResource(http);
    this.descriptions = new PhotoDescriptionsResource(http);
  }

  /**
   * List photos with optional filtering parameters.
   *
   * @param query Pagination and filtering parameters mirrored from the spec.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Photo} records.
   * @throws {APIError} When the API responds with an error status.
   */
  async list(
    query?: ListPhotosQueryParams,
    options?: RequestOptions
  ): Promise<Photo[]> {
    const response = await this.http.request<Photo[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: "/photos",
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Retrieve a single photo by identifier.
   *
   * @param photoId Identifier of the photo to fetch.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The requested {@link Photo}.
   * @throws {APIError} When the API responds with an error status.
   */
  async retrieve(photoId: string, options?: RequestOptions): Promise<Photo> {
    const response = await this.http.request<Photo>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/photos/${encodePathParam(photoId)}`,
    });

    return response.data;
  }

  /**
   * Update a photo, typically toggling the internal flag.
   *
   * @param photoId Identifier of the photo to update.
   * @param body Patch payload that follows the spec-defined structure.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link Photo}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    photoId: string,
    body: UpdatePhotoRequestBody,
    options?: RequestOptions
  ): Promise<Photo> {
    const response = await this.http.request<Photo>({
      ...buildRequestConfig(options),
      method: "PUT",
      url: `/photos/${encodePathParam(photoId)}`,
      data: body,
    });

    return response.data;
  }

  /**
   * Delete a photo.
   *
   * @param photoId Identifier of the photo to delete.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns Resolves to void when deletion succeeds.
   * @throws {APIError} When the API responds with an error status.
   */
  async delete(
    photoId: string,
    options?: UserScopedRequestOptions
  ): Promise<void> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    await this.http.request<void>({
      ...buildRequestConfig(requestOptions),
      method: "DELETE",
      url: `/photos/${encodePathParam(photoId)}`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
    });
  }
}

/**
 * Manage tags applied to a photo.
 */
export class PhotoTagsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List tags assigned to the specified photo.
   *
   * @param photoId Identifier of the photo whose tags should be retrieved.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Tag} records.
   * @throws {APIError} When the API responds with an error status.
   */
  async list(photoId: string, options?: RequestOptions): Promise<Tag[]> {
    const response = await this.http.request<Tag[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/photos/${encodePathParam(photoId)}/tags`,
    });

    return response.data;
  }

  /**
   * Create or assign tags to the photo using the spec-defined endpoint.
   *
   * @param photoId Identifier of the target photo.
   * @param body Payload describing the tags to create or assign.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The created tag association payload returned by the API.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    photoId: string,
    body: CreatePhotoTagsRequestBody,
    options?: RequestOptions
  ): Promise<Tag> {
    const response = await this.http.request<Tag>({
      ...buildRequestConfig(options),
      method: "POST",
      url: `/photos/${encodePathParam(photoId)}/tags`,
      data: body,
    });

    return response.data;
  }
}

/**
 * Manage comments on a photo.
 */
export class PhotoCommentsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * List comments attached to the specified photo.
   *
   * @param photoId Identifier of the photo to inspect.
   * @param query Optional pagination controls (`page`, `per_page`).
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns Array of {@link Comment} records.
   * @throws {APIError} When the API responds with an error status.
   */
  async list(
    photoId: string,
    query?: PaginationQueryParams,
    options?: RequestOptions
  ): Promise<Comment[]> {
    const response = await this.http.request<Comment[]>({
      ...buildRequestConfig(options),
      method: "GET",
      url: `/photos/${encodePathParam(photoId)}/comments`,
      params: cleanQueryParameters(query),
    });

    return response.data;
  }

  /**
   * Create a comment on the photo.
   *
   * @param photoId Identifier of the photo to comment on.
   * @param body Payload describing the comment text to create.
   * @param options Optional request overrides; supply `X-CompanyCam-User` to attribute the action.
   * @returns The created {@link Comment}.
   * @throws {APIError} When the API responds with an error status.
   */
  async create(
    photoId: string,
    body: CreatePhotoCommentRequestBody,
    options?: UserScopedRequestOptions
  ): Promise<Comment> {
    const { requestOptions, userContext } = splitUserScopedOptions(options);
    const response = await this.http.request<Comment>({
      ...buildRequestConfig(requestOptions),
      method: "POST",
      url: `/photos/${encodePathParam(photoId)}/comments`,
      headers: userContext ? { "X-CompanyCam-User": userContext } : undefined,
      data: body,
    });

    return response.data;
  }
}

/**
 * Manage the editable description content for a photo.
 */
export class PhotoDescriptionsResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Update the description of a photo.
   *
   * @param photoId Identifier of the photo to update.
   * @param body Payload providing the new description text.
   * @param options Optional request overrides such as alternate auth token or abort signal.
   * @returns The updated {@link Photo}.
   * @throws {APIError} When the API responds with an error status.
   */
  async update(
    photoId: string,
    body: UpdatePhotoDescriptionRequestBody,
    options?: RequestOptions
  ): Promise<Photo> {
    const response = await this.http.request<Photo>({
      ...buildRequestConfig(options),
      method: "POST",
      url: `/photos/${encodePathParam(photoId)}/descriptions`,
      data: body,
    });

    return response.data;
  }
}
