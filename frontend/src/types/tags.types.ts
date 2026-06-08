export interface ITagListItem {
  id: number;
  name: string;
  slug: string;
  blogs_count: number;
  projects_count: number;
}

export type TTagListResponse = TResponseArr<ITagListItem>;
