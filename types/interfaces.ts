export interface ICompany {
  name?: string;
  address?: string;
  zipcode?: string;
  city?: string;
  country?: string;
  fiscal_year?: {
    month?: number;
  };
}

export interface IUser {
  id: string;
  firstname: string;
  lastname: string;
  phone: string;
  email: string;
  newsletter?: boolean;
  company?: ICompany;
}
