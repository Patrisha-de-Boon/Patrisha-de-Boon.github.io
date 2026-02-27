export type PortfolioItem = {
  id: string;
  urls: string[];
  titles: string[];
  text: string;
  imagePaths?: string[];
};

export type PortfolioContentProps = {
  body: string;
  items: PortfolioItem[];
};
