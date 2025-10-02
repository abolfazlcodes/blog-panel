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

export type TSingleBlogDataResponseProps = TResponse<ISingleBlogData>;
export type TBlogsDataResponseProps = TResponseArr<IBlogsCardProps>;
