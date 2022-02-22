import { isError } from '../../utils/isError';
import { TMonadGenerator } from '../../types/monad';

export const AsyncMapGenerator = <R1, R2>(
    fn: (data: R1) => Promise<R2>
): ReturnType<TMonadGenerator<R1, R2>> => {
    return (data: R1, next: (data: R2 | Error) => void) => {
        if (isError(data)) {
            next(data);
        } else {
            try {
                fn(data)
                    .then((res) => {
                        next(res);
                    })
                    .catch((e) => {
                        next(e);
                    });
            } catch (e) {
                next(e);
            }
        }
    };
};
