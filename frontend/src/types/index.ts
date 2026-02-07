export interface Person {
    PCODE: number;
    FCODE?: number;
    PNAME?: string;
    PBIRTH?: string;
    PIDNUM?: string;
    PIDNUM2?: string;
    OLDIDNUM?: string;
    SEX?: string;
    RELATION?: string;
    RELATION2?: string;
    CRIPPLED?: string;
    VINFORM?: string;
    AGREE?: string;
    LASTCHECK?: string;
    PERINFO?: string;
    CARDCHECK?: string;
    JAEHAN?: string;
    SEARCHID?: string;
    PCCHECK?: string;
    PSNIDT?: string;
    PSNID?: string;
    MEMO1?: string;
    MEMO2?: string;
}

export interface Pagination {
    total: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: Pagination;
}
