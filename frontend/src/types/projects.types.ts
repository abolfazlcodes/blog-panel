export interface IProjectCardProps {
  id: number;
  title: string;
  short_description: string;
  description: string;
  slug: string;
  cover_image: string;
  created_at: string;
  published_at: string;
  updated_at: string;
  is_draft: true;
}

// export type TSingleBlogDataResponseProps = TResponse<ISingleBlogData>;
export type TProjectsDataResponseProps = TResponseArr<IProjectCardProps>;
export type TCreateProjectResponseProps = TResponse<object>;
