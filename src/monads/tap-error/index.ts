import { isError } from '../../utils/isError';
import { TMonadGenerator } from '../../types/monad';

export const TapErrorGenerator = <R1>(
    fn: (data: R1 | Error) => void
): ReturnType<TMonadGenerator<R1, R1>> => {
    return (data: R1 | Error, next: (data: R1 | Error) => void) => {
        if (isError(data)) {
            try {
                fn(data as Error);
            } catch (e) {
                next(e);
                return;
            }
        }
        next(data);
    };
};
