export interface ISidebarLinkProp {
  id: number;
  title: string;
  href: string;
}

export const SIDEBAR_LINKS: ISidebarLinkProp[] = [
  {
    id: 1,
    title: "Home",
    href: "/",
  },
  {
    id: 2,
    title: "Blogs",
    href: "/blogs",
  },
  {
    id: 3,
    title: "Write Blog",
    href: "/add-blog",
  },
  {
    id: 4,
    title: "Projects",
    href: "/projects",
  },
  {
    id: 5,
    title: "Add Project",
    href: "/add-project",
  },
];
