export const isError = (data: any): data is Error => {
    return data instanceof Error;
};
