import { isError } from '../../utils/isError';
import { TMonadGenerator } from '../../types/monad';

export const MapGenerator = <R1, R2>(fn: (data: R1) => R2): ReturnType<TMonadGenerator<R1, R2>> => {
    return (data: R1, next: (data: R2 | Error) => void) => {
        if (isError(data)) {
            next(data as Error);
        } else {
            try {
                const res = fn(data);
                next(res);
            } catch (e) {
                next(e);
            }
        }
    };
};
