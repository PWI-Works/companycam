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
 * Resource for working with photos and their nested relationships.
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
   * Add tags to the photo.
   */
  async add(
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
