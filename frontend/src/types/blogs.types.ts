import type { ISeriesSummary } from "./series.types";

export interface IBlogsCardProps {
  id: number;
  title: string;
  short_description: string;
  description: string;
  slug: string;
  cover_image: string;
  likes_count: number;
  views_count: number;
  created_at: string;
  published_at: string;
  updated_at: string;
  is_draft: true;
  reading_time: number;
  is_featured: boolean;
  series?: ISeriesSummary | null;
  series_order?: number | null;
  tags?: string[];
}

export interface ISingleBlogData extends IBlogsCardProps {
  content: string;
  seriesId?: number | null;
}

export interface IBlogFormProps {
  title: string;
  short_description: string;
  description: string;
  content: string;
  cover_image: string;
  is_featured: boolean;
  // "" = no series; otherwise the numeric series id as a string (native <select>)
  seriesId: string;
  series_order: number | null;
  tags: string[];
}

export interface IBlogFormDefaultValues extends IBlogFormProps {
  id: string;
  is_draft: boolean;
  is_featured: boolean;
}

export type TSingleBlogDataResponseProps = TResponse<ISingleBlogData>;
export type TBlogsDataResponseProps = TResponseArr<IBlogsCardProps>;
export type TCreateBlogResponseProps = TResponse<object>;
export type TDeleteBlogResponseProps = TResponse<object>;
