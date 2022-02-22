import { isPromise } from '../../utils/isPromise';
import { TMonadGenerator } from '../../types/monad';

export const IdentityGenerator = <R1>(
    fn: (data: R1 | Error) => void | Promise<void>
): ReturnType<TMonadGenerator<R1, R1>> => {
    return (data: R1 | Error, next: (data: R1 | Error) => void) => {
        try {
            let res = fn(data);
            if (!isPromise(res)) {
                next(data);
            } else {
                res.catch(() => {}).finally(() => {
                    next(data);
                });
            }
        } catch (e) {
            next(data);
        }
    };
};
