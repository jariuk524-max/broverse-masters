export type ServiceItem = {
  name: string;
  description: string;
};

export type ServiceCategory = {
  name: string;
  items: ServiceItem[];
};
