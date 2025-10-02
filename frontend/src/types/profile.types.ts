export interface IUserProfileProps {
  name: string;
  email: string;
  username: string;
}

export type TProfileResponseProps = TResponse<IUserProfileProps>;
