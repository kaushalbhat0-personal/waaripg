export type PaginationParams = {
  page: number;
  pageSize: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type SortDirection = "asc" | "desc";

export type SortParams = {
  column: string;
  direction: SortDirection;
};

export type QueryOptions = {
  pagination?: PaginationParams;
  sort?: SortParams;
  search?: string;
  filters?: Record<string, unknown>;
};

export type ActionError = {
  code: string;
  message: string;
  details?: Record<string, string[]>;
};

export type ActionSuccess<T = void> = {
  data: T;
  message?: string;
};

export type ActionResponse<T = void> =
  | { success: true; data: T; message?: string }
  | { success: false; error: ActionError };

export type DateRange = {
  from: Date | undefined;
  to: Date | undefined;
};

export type StatusBadge = {
  label: string;
  variant: "default" | "secondary" | "destructive" | "outline" | "success" | "warning";
};

export type SelectOption = {
  label: string;
  value: string;
  disabled?: boolean;
};

export type NavigationItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  disabled?: boolean;
};

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export type TableColumn<T> = {
  id: string;
  header: string;
  accessorKey: keyof T | ((row: T) => React.ReactNode);
  sortable?: boolean;
  hidden?: boolean;
  cell?: (row: T) => React.ReactNode;
};

export type TableAction<T> = {
  label: string;
  onClick: (row: T) => void;
  icon?: React.ComponentType<{ className?: string }>;
  disabled?: boolean;
  variant?: "default" | "destructive" | "outline";
};
