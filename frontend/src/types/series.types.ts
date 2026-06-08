export interface ISeriesSummary {
  id: number;
  title: string;
  slug: string;
}

export interface ISeriesListItem extends ISeriesSummary {
  description: string | null;
  created_at: string;
  updated_at: string;
  blogs_count: number;
}

export interface ISeriesBlogItem {
  id: number;
  title: string;
  slug: string;
  series_order: number | null;
  is_draft: boolean;
}

export interface ISeriesDetail extends ISeriesSummary {
  description: string | null;
  created_at: string;
  updated_at: string;
  blogs: ISeriesBlogItem[];
}

export interface ISeriesFormProps {
  title: string;
  description: string;
}

export type TSeriesListResponse = TResponseArr<ISeriesListItem>;
export type TSeriesDetailResponse = TResponse<ISeriesDetail>;
export type TMutateSeriesResponse = TResponse<ISeriesSummary>;
