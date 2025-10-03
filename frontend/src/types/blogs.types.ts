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
}

export interface ISingleBlogData extends IBlogsCardProps {
  content: string;
}

export interface IBlogFormProps {
  title: string;
  short_description: string;
  description: string;
  content: string;
  cover_image: string;
}

export interface IBlogFormDefaultValues extends IBlogFormProps {
  id: string;
  is_draft: boolean;
}

export type TSingleBlogDataResponseProps = TResponse<ISingleBlogData>;
export type TBlogsDataResponseProps = TResponseArr<IBlogsCardProps>;
export type TCreateBlogResponseProps = TResponse<object>;
